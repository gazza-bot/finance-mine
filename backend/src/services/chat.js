const pool = require('../db');
const { formatRupiah } = require('./finance');

async function saveMessage(role, content) {
  const [result] = await pool.query(
    'INSERT INTO chat_messages (role, content) VALUES (?, ?)',
    [role, content]
  );
  const [rows] = await pool.query(
    'SELECT id, role, content, created_at FROM chat_messages WHERE id = ?',
    [result.insertId]
  );
  return rows[0];
}

async function getMessages(limit = 30) {
  const [rows] = await pool.query(
    `SELECT id, role, content, created_at
     FROM (
       SELECT id, role, content, created_at
       FROM chat_messages
       ORDER BY id DESC
       LIMIT ?
     ) AS recent
     ORDER BY id ASC`,
    [Number(limit)]
  );
  return rows;
}

function ruleBasedReply(message, ctx, analysis, options = {}) {
  const m = String(message).toLowerCase();

  if (/^(halo|hai|hi|hello|pagi|siang|sore|malam)/.test(m)) {
    return 'Halo! Aku Si Koin, teman keuanganmu. Mau tanya sisa budget, pengeluaran hari ini, atau gimana caranya hemat?';
  }

  if (/boros|hemat|penilaian|nilai|gimana (keuangan|pengeluaran)|komen/.test(m)) {
    return `${analysis.verdict}: ${analysis.message}`;
  }

  if (/sisa|budget|anggaran|jatah/.test(m)) {
    if (!ctx.budget) {
      return 'Budget bulan ini belum diatur. Isi dulu di kartu Budget supaya aku bisa hitung sisa uangmu.';
    }
    if (analysis.sisa < 0) {
      return `Budget bulan ini ${formatRupiah(ctx.budget)}, tapi pengeluaranmu sudah ${formatRupiah(ctx.expenseMonth)} — kelebihan ${formatRupiah(Math.abs(analysis.sisa))}. Sisa ${ctx.daysLeft} hari lagi menuju bulan baru, ketat ya.`;
    }
    return `Sisa budget bulan ini ${formatRupiah(analysis.sisa)} untuk ${ctx.daysLeft} hari ke depan, jadi kira-kira boleh keluar ${formatRupiah(analysis.budgetHarian)} per hari.`;
  }

  if (/hari ini|malam ini|siang ini|nanti/.test(m)) {
    if (ctx.expenseToday <= analysis.budgetHarian && ctx.budget) {
      return `Hari ini kamu sudah keluar ${formatRupiah(ctx.expenseToday)}, masih di bawah budget harian ${formatRupiah(analysis.budgetHarian)}. Aman!`;
    }
    if (!ctx.budget) {
      return `Hari ini kamu keluar ${formatRupiah(ctx.expenseToday)}. Budget belum diatur, jadi belum bisa aku bandingkan.`;
    }
    return `Hari ini kamu keluar ${formatRupiah(ctx.expenseToday)}, padahal budget harian cuma ${formatRupiah(analysis.budgetHarian)}. Pelan-pelan ya.`;
  }

  if (/bulan baru|akhir bulan|berapa hari|tenggat|sisa hari/.test(m)) {
    return `Masih ada ${ctx.daysLeft} hari lagi menuju bulan baru (termasuk hari ini). Sisa budget ${ctx.budget ? formatRupiah(analysis.sisa) : 'belum diatur'}.`;
  }

  if (/total|pengeluaran bulan|bulan ini|pemasukan/.test(m)) {
    return `Pengeluaranmu bulan ini ${formatRupiah(ctx.expenseMonth)}${ctx.budget ? ` dari budget ${formatRupiah(ctx.budget)}` : ''}.`;
  }

  if (/saran|tips|hemat gimana|bagaimana cara/.test(m)) {
    if (!ctx.budget) {
      return 'Saran pertamaku: atur budget bulan ini dulu, baru aku bisa kasih saran yang nyambung dengan kondisimu.';
    }
    if (analysis.sisa < 0) {
      return 'Karena sudah over budget, coba tunda belanja non-esensial sampai bulan depan dan catat semua pengeluaran harian.';
    }
    return `Dengan sisa ${formatRupiah(analysis.sisa)} untuk ${ctx.daysLeft} hari, usahakan pengeluaran harianmu di bawah ${formatRupiah(analysis.budgetHarian)}.`;
  }

  if (options.mode === 'llm_error') {
    return 'Aku lagi ada gangguan ke AI-ku (server lagi sibuk). Coba tanya lagi bentar lagi ya!';
  }

  return 'Aku belum paham maksudmu. Coba tanya soal sisa budget, pengeluaran hari ini, atau penilaian boros/hemat ku. (Isi GEMINI_API_KEY di backend/.env biar aku bisa ngobrol bebas!)';
}

module.exports = { saveMessage, getMessages, ruleBasedReply };
