const { formatRupiah } = require('./finance');

function analyze(ctx) {
  const { budget, expenseMonth, expenseToday, daysLeft, daysInMonth } = ctx;

  const base = {
    sisa: 0,
    sisaHari: daysLeft,
    budgetHarian: 0,
    expenseBulanIni: expenseMonth,
    expenseHariIni: expenseToday,
    hariDalamBulan: daysInMonth,
  };

  if (!budget || budget <= 0) {
    return {
      ...base,
      mood: 'no_budget',
      verdict: 'Belum ada budget',
      message:
        'Set budget bulan ini dulu dong, biar aku bisa nilai pengeluaranmu boros atau enggak.',
    };
  }

  const sisa = budget - expenseMonth;

  if (sisa < 0) {
    const kelebihan = Math.abs(sisa);
    return {
      ...base,
      mood: 'overspend',
      verdict: 'Over budget',
      sisa,
      message: `Meledak! Pengeluaranmu sudah kelebihan ${formatRupiah(kelebihan)} dari budget bulan ini. Tinggal ${daysLeft} hari lagi menuju bulan baru, ketat dikit ya mulai sekarang.`,
    };
  }

  const budgetHarian = sisa / Math.max(daysLeft, 1);
  const baseResult = { ...base, sisa, budgetHarian };

  if (expenseToday <= budgetHarian * 0.5) {
    return {
      ...baseResult,
      mood: 'hemat',
      verdict: 'Sangat hemat',
      message: `Hari ini kamu cuma keluar ${formatRupiah(expenseToday)}, padahal budget harianmu ${formatRupiah(budgetHarian)}. Hebat, sangat hemat! Boleh sesekali kasih reward diri sendiri.`,
    };
  }

  if (expenseToday <= budgetHarian) {
    return {
      ...baseResult,
      mood: 'oke',
      verdict: 'Aman',
      message: `Pengeluaran hari ini ${formatRupiah(expenseToday)}, masih sesuai budget harian ${formatRupiah(budgetHarian)}. Aman, pertahankan!`,
    };
  }

  if (expenseToday <= budgetHarian * 1.5) {
    return {
      ...baseResult,
      mood: 'waspada',
      verdict: 'Waspada',
      message: `Hari ini keluar ${formatRupiah(expenseToday)}, padahal budget harian ${formatRupiah(budgetHarian)}. Mulai banyak nih, sisa ${daysLeft} hari lagi menuju bulan baru. Hati-hati ya.`,
    };
  }

  return {
    ...baseResult,
    mood: 'boros',
    verdict: 'Boros',
    message: `Boros! Hari ini kamu keluar ${formatRupiah(expenseToday)}, padahal budget harian cuma ${formatRupiah(budgetHarian)}. Sisa ${formatRupiah(sisa)} harus cukup buat ${daysLeft} hari ke depan.`,
  };
}

module.exports = { analyze };
