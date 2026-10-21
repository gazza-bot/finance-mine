const express = require('express');
const pool = require('../db');
const { getCurrentYm, isValidYm } = require('../services/finance');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const month = req.query.month || getCurrentYm();
    if (!isValidYm(month)) {
      return res
        .status(400)
        .json({ error: 'month harus format YYYY-MM' });
    }

    const [rows] = await pool.query(
      'SELECT `year_month`, amount FROM budgets WHERE `year_month` = ?',
      [month]
    );
    res.json({
      year_month: month,
      amount: rows[0] ? Number(rows[0].amount) : null,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const { month, amount } = req.body;

    if (!isValidYm(month)) {
      return res.status(400).json({ error: 'month harus format YYYY-MM' });
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount harus angka positif' });
    }

    await pool.query(
      `INSERT INTO budgets (\`year_month\`, amount) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [month, Number(amount)]
    );

    const [rows] = await pool.query(
      'SELECT `year_month`, amount FROM budgets WHERE `year_month` = ?',
      [month]
    );
    res.json({
      year_month: rows[0].year_month,
      amount: Number(rows[0].amount),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
