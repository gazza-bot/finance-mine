const pool = require('../db');

const TIMEZONE = 'Asia/Jakarta';

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function getToday() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getCurrentYm() {
  return getToday().slice(0, 7);
}

function isValidYm(ym) {
  return typeof ym === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(ym);
}

function getDaysInMonth(ym) {
  const [year, month] = ym.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getMonthRange(ym) {
  const days = getDaysInMonth(ym);
  return {
    start: `${ym}-01`,
    end: `${ym}-${String(days).padStart(2, '0')}`,
  };
}

function getDaysLeftInMonth(today = getToday()) {
  const ym = today.slice(0, 7);
  const dayOfMonth = Number(today.slice(8, 10));
  return Math.max(getDaysInMonth(ym) - dayOfMonth + 1, 0);
}

async function getExpenseByMonth(ym) {
  const { start, end } = getMonthRange(ym);
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE type = 'expense' AND date >= ? AND date <= ?`,
    [start, end]
  );
  return Number(rows[0].total);
}

async function getExpenseToday(today = getToday()) {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE type = 'expense' AND date = ?`,
    [today]
  );
  return Number(rows[0].total);
}

async function getRecentTransactions(limit = 10) {
  const [rows] = await pool.query(
    'SELECT type, amount, category, date, description FROM transactions ORDER BY date DESC, id DESC LIMIT ?',
    [Number(limit)]
  );
  return rows;
}

async function getBudget(ym) {
  const [rows] = await pool.query(
    'SELECT `year_month`, amount FROM budgets WHERE `year_month` = ?',
    [ym]
  );
  return rows[0] || null;
}

async function getFinanceContext(ym = getCurrentYm()) {
  const today = getToday();
  const [budget, expenseMonth, expenseToday] = await Promise.all([
    getBudget(ym),
    getExpenseByMonth(ym),
    getExpenseToday(today),
  ]);
  const daysInMonth = getDaysInMonth(ym);
  const daysLeft = getDaysLeftInMonth(today);

  return {
    ym,
    today,
    budget: budget ? Number(budget.amount) : null,
    expenseMonth,
    expenseToday,
    daysInMonth,
    daysLeft,
  };
}

module.exports = {
  TIMEZONE,
  formatRupiah,
  getToday,
  getCurrentYm,
  isValidYm,
  getDaysInMonth,
  getMonthRange,
  getDaysLeftInMonth,
  getExpenseByMonth,
  getExpenseToday,
  getRecentTransactions,
  getBudget,
  getFinanceContext,
};
