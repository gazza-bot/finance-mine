require('dotenv').config();
const express = require('express');
const cors = require('cors');

const config = require('./src/config');
const pool = require('./src/db');
const errorHandler = require('./src/middleware/errorHandler');
const transactionsRouter = require('./src/routes/transactions');
const budgetRouter = require('./src/routes/budget');
const aiRouter = require('./src/routes/ai');
const chatRouter = require('./src/routes/chat');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionsRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/ai', aiRouter);
app.use('/api/chat', chatRouter);

app.use(errorHandler);

pool
  .query('SELECT 1')
  .then(() => {
    app.listen(config.PORT, () => {
      console.log(`Server berjalan di http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MySQL:', err.message);
    process.exit(1);
  });
