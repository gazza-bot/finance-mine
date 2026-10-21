require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

app.get('/api/transactions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/transactions', async (req, res, next) => {
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

app.delete('/api/transactions/:id', async (req, res, next) => {
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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

pool
  .query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MySQL:', err.message);
    process.exit(1);
  });
