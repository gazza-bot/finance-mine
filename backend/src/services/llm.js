const config = require('../config');
const { formatRupiah, getRecentTransactions } = require('./finance');

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const MAX_RETRIES = 2;

function isAiEnabled() {
  return Boolean(config.GEMINI_API_KEY);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err) {
  if (err.code === 'FETCH_FAILED') return true;
  if (typeof err.status === 'number') {
    return err.status === 429 || err.status >= 500;
  }
  return false;
}

async function callGemini(systemPrompt, contents) {
  const url = `${API_BASE}/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        });
      } catch (fetchErr) {
        const err = new Error(`Gagal terhubung ke Gemini: ${fetchErr.message}`);
        err.code = 'FETCH_FAILED';
        throw err;
      }

      if (!res.ok) {
        const body = await res.text();
        const err = new Error(`Gemini API ${res.status}: ${body.slice(0, 200)}`);
        err.status = res.status;
        throw err;
      }

      const data = await res.json();

      if (data.promptFeedback?.blockReason) {
        throw new Error(
          `Permintaan diblokir Gemini: ${data.promptFeedback.blockReason}`
        );
      }

      const candidate = data.candidates?.[0];
      const finishReason = candidate?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        const err = new Error(`Gemini finishReason: ${finishReason}`);
        err.status = 502;
        throw err;
      }

      const parts = (candidate?.content?.parts || []).filter((p) => !p.thought);
      const text = parts
        .map((p) => p.text || '')
        .join('')
        .trim();
      if (!text) throw new Error('Gemini mengembalikan balasan kosong');
      return text;
    } catch (err) {
      if (!isRetryable(err) || attempt === MAX_RETRIES) throw err;
      const delay = attempt === 0 ? 700 : 2000;
      console.warn(
        `Gemini gagal (${err.message.slice(0, 80)}), coba lagi dalam ${delay}ms...`
      );
      await sleep(delay);
    }
  }
}

function sanitizeReply(text) {
  if (!text) return '';
  let t = String(text).trim();
  t = t.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  t = t.replace(/\*([^*\n]+)\*/g, '$1');
  t = t.replace(/`+/g, '');
  t = t.replace(/^\s*#{1,6}\s*/gm, '');
  t = t.replace(/\b(sentence|kalimat)\s*\d+\s*:\s*/gi, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function finalizeReply(raw) {
  const clean = sanitizeReply(raw);
  if (!clean || clean.length > 2000) {
    throw new Error('Balasan LLM tidak valid setelah sanitasi');
  }
  return clean;
}

function buildFinanceSummary(ctx, analysis, recentTx = []) {
  const lines = [
    'KONTEKS KEUANGAN PENGGUNA (dalam Rupiah):',
    `- Bulan: ${ctx.ym}, hari ini: ${ctx.today}`,
    `- Budget bulanan: ${ctx.budget ? formatRupiah(ctx.budget) : 'belum diatur'}`,
    `- Pengeluaran bulan ini: ${formatRupiah(ctx.expenseMonth)}`,
    `- Pengeluaran hari ini: ${formatRupiah(ctx.expenseToday)}`,
    `- Sisa budget: ${formatRupiah(analysis.sisa)}`,
    `- Sisa hari sampai bulan baru: ${ctx.daysLeft} hari (bulan ini ${ctx.daysInMonth} hari)`,
    `- Budget harian sisa: ${formatRupiah(analysis.budgetHarian)}`,
    `- Penilaian otomatis: ${analysis.verdict} (mood: ${analysis.mood})`,
  ];

  if (recentTx.length > 0) {
    lines.push('- Transaksi terbaru:');
    recentTx.forEach((t) => {
      const desc = t.description ? ` — ${t.description}` : '';
      lines.push(
        `  * ${t.date} | ${t.type === 'income' ? 'pemasukan' : 'pengeluaran'} | ${t.category}${desc} | ${formatRupiah(Number(t.amount))}`
      );
    });
  }

  return lines.join('\n');
}

const PLAINTEXT_RULE =
  'Balasan HARUS plain text saja: tanpa markdown, tanpa asterisk atau underscore, tanpa label seperti "Sentence 1:" atau "Kalimat 1:"';

function toContents(history, userMessage) {
  const contents = history
    .filter((m) => m.content)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: sanitizeReply(m.content) || String(m.content) }],
    }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });
  return contents;
}

async function generateComment(ctx, analysis) {
  const recentTx = await getRecentTransactions(10);
  const summary = buildFinanceSummary(ctx, analysis, recentTx);
  const systemPrompt = [
    'Kamu adalah "Si Koin", maskot keuangan yang lucu, ceria, dan sedikit usil tapi peduli.',
    'Kamu memberi komentar singkat (2-3 kalimat maksimal) soal pengeluaran terbaru pengguna, berdasarkan data di bawah.',
    'Nilai apakah pengeluarannya boros atau hemat terhadap sisa budget dan sisa hari sampai bulan baru.',
    'Selalu dalam Bahasa Indonesia santai, gaul, sopan, tanpa emoji berlebihan (maksimal 2 emoji).',
    'Jangan mengarang angka yang tidak ada di data.',
    PLAINTEXT_RULE + '.',
    summary,
  ].join('\n');

  const userMessage =
    'Beri komentar untuk transaksi terbaruku barusan, nilai boros/tidaknya dan kasih saran singkat.';
  const raw = await callGemini(systemPrompt, toContents([], userMessage));
  return finalizeReply(raw);
}

async function generateChatReply(userMessage, ctx, analysis, history) {
  const recentTx = await getRecentTransactions(10);
  const summary = buildFinanceSummary(ctx, analysis, recentTx);
  const systemPrompt = [
    'Kamu adalah "Si Koin", maskot keuangan yang lucu, ceria, dan peduli terhadap keuangan pengguna.',
    'Jawab pertanyaan pengguna seputar keuangannya berdasarkan data di bawah.',
    'Jawaban dalam Bahasa Indonesia santai, singkat (maksimal 3 kalimat), tanpa emoji berlebihan (maksimal 2 emoji).',
    'Jangan mengarang angka yang tidak ada di data.',
    'Kalau ditanya di luar topik keuangan, jawab dengan singkat lalu arahkan kembali ke keuangannya.',
    PLAINTEXT_RULE + '.',
    summary,
  ].join('\n');

  const raw = await callGemini(systemPrompt, toContents(history, userMessage));
  return finalizeReply(raw);
}

module.exports = {
  isAiEnabled,
  generateComment,
  generateChatReply,
  sanitizeReply,
};
