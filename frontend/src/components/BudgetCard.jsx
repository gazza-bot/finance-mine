import { useState } from "react";
import { formatRupiah, formatMonthLabel, CURRENT_YM } from "../lib/format";

const inputClass =
  "w-full rounded-brutal border-[3px] border-ink bg-white px-4 py-3 text-sm font-medium text-ink placeholder:text-ink/50 transition focus:bg-yellow-soft focus:shadow-brutal-sm focus:outline-none";

const labelClass =
  "mb-2 block text-[11px] font-bold tracking-[0.15em] text-ink/70 uppercase";

const btnClass =
  "rounded-brutal border-[3px] border-ink px-4 py-2 text-[11px] font-bold tracking-[0.1em] text-ink uppercase shadow-brutal-xs transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

export default function BudgetCard({
  budget,
  insight,
  loaded,
  saving,
  onSave,
}) {
  const [mode, setMode] = useState("auto");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const hasBudget = budget !== null && budget !== undefined;
  const month = insight?.ym || CURRENT_YM;
  const editing = mode === "edit" || (mode === "auto" && !hasBudget);

  const startEdit = () => {
    setAmount(String(budget));
    setError("");
    setMode("edit");
  };

  const cancelEdit = () => {
    setAmount(String(budget));
    setError("");
    setMode("view");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!amount || Number(amount) <= 0) {
      setError("Budget harus lebih besar dari 0");
      return;
    }
    try {
      await onSave(month, Number(amount));
      setMode("view");
    } catch (err) {
      setError(err.message);
    }
  };

  const expense = insight?.expenseBulanIni ?? 0;
  const daysLeft = insight?.sisaHari ?? 0;
  const budgetHarian = insight?.budgetHarian ?? 0;
  const sisa = hasBudget ? budget - expense : 0;
  const pct = hasBudget && budget > 0 ? (expense / budget) * 100 : 0;
  const fillClass =
    pct >= 100 ? "bg-pink" : pct >= 80 ? "bg-yellow" : "bg-lime";

  return (
    <div className="rounded-brutal border-[3px] border-ink bg-white p-7 shadow-brutal">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink">
          Budget Bulan Ini
        </h2>
        <span className="rounded-brutal border-2 border-ink bg-primary px-2.5 py-1 text-[11px] font-bold tracking-widest text-white uppercase shadow-brutal-xs">
          {formatMonthLabel(month)}
        </span>
      </div>

      {!loaded ? (
        <p className="mt-6 rounded-brutal border-[3px] border-dashed border-ink/40 px-6 py-10 text-center text-[11px] font-bold tracking-[0.15em] text-ink/60 uppercase">
          Memuat budget...
        </p>
      ) : editing ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="budget" className={labelClass}>
            Budget Pengeluaran (Rp)
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="budget"
              type="number"
              min="1"
              step="any"
              placeholder="3000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={saving}
              className={`${btnClass} shrink-0 bg-yellow shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {saving ? "Menyimpan..." : hasBudget ? "Simpan" : "Atur Budget"}
            </button>
            {hasBudget && (
              <button
                type="button"
                onClick={cancelEdit}
                className={`${btnClass} shrink-0 bg-white hover:bg-canvas`}
              >
                Batal
              </button>
            )}
          </div>
          {!hasBudget && (
            <p className="mt-3 text-sm font-medium text-ink/60">
              Isi budget bulan ini biar Si Koin bisa nilai pengeluaranmu boros
              atau enggak.
            </p>
          )}
          {error && (
            <p className="mt-3 rounded-brutal border-[3px] border-ink bg-pink px-4 py-2 text-sm font-bold text-ink shadow-brutal-xs">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] text-ink/60 uppercase">
                Total Budget
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-ink">
                {formatRupiah(budget)}
              </p>
            </div>
            <button
              type="button"
              onClick={startEdit}
              className={`${btnClass} bg-white hover:bg-yellow-soft`}
            >
              Ubah
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.1em] text-ink/70 uppercase">
              <span>Terkpakai {formatRupiah(expense)}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="mt-2 h-6 overflow-hidden rounded-brutal border-[3px] border-ink bg-canvas">
              <div
                className={`h-full ${fillClass} transition-all duration-500`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-brutal border-[3px] border-ink bg-yellow-soft px-4 py-3">
              <p className="text-[11px] font-bold tracking-[0.1em] text-ink/60 uppercase">
                Sisa Budget
              </p>
              <p
                className={`mt-1 font-display text-lg font-bold ${sisa < 0 ? "text-pink-dark" : "text-lime-dark"}`}
              >
                {formatRupiah(sisa)}
              </p>
            </div>
            <div className="rounded-brutal border-[3px] border-ink bg-canvas px-4 py-3">
              <p className="text-[11px] font-bold tracking-[0.1em] text-ink/60 uppercase">
                Boleh/Hari
              </p>
              <p className="mt-1 font-display text-lg font-bold text-ink">
                {formatRupiah(Math.max(budgetHarian, 0))}
              </p>
            </div>
          </div>

          <p className="mt-4 inline-block rounded-brutal border-2 border-ink bg-primary px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] text-white uppercase shadow-brutal-xs">
            {daysLeft} hari lagi menuju bulan baru
          </p>
        </div>
      )}
    </div>
  );
}
