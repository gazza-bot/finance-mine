const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { type, amount, category, date, description } = req.body;

    if (!type || !amount || !category || !date) {
      return res
        .status(400)
        .json({ error: 'type, amount, category, dan date wajib diisi' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res
        .status(400)
        .json({ error: "type harus 'income' atau 'expense'" });
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount harus angka positif' });
    }

    const [result] = await pool.query(
      'INSERT INTO transactions (type, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
      [type, Number(amount), category, date, description || null]
    );

    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ error: 'id tidak valid' });
    }

    const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    res.json({ message: 'Transaksi berhasil dihapus', id: Number(id) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
