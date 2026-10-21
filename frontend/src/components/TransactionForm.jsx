import { useState } from "react";

const API_URL = "http://localhost:5000/api";

const inputClass =
  "w-full rounded-brutal border-[3px] border-ink bg-white px-4 py-3 text-sm font-medium text-ink placeholder:text-ink/50 transition focus:bg-yellow-soft focus:shadow-brutal-sm focus:outline-none";

const labelClass =
  "mb-2 block text-[11px] font-bold tracking-[0.15em] text-ink/70 uppercase";

const toggleBase =
  "rounded-brutal border-[3px] border-ink px-4 py-3 text-sm font-bold transition-all duration-150 active:translate-y-[2px] active:shadow-none";

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ onSuccess }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Nominal harus lebih besar dari 0");
      return;
    }
    if (!category.trim()) {
      setError("Kategori wajib diisi");
      return;
    }
    if (!date) {
      setError("Tanggal wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category: category.trim(),
          date,
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menambahkan transaksi");
      }

      setAmount("");
      setCategory("");
      setDate(today());
      setDescription("");
      setType("expense");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-brutal border-[3px] border-ink bg-white p-7 shadow-brutal"
    >
      <h2 className="font-display text-xl font-bold text-ink">
        Tambah Transaksi
      </h2>
      <p className="mt-1 text-sm font-medium text-ink/60">
        Catat pemasukan atau pengeluaran baru.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setType("income")}
          className={`${toggleBase} ${
            type === "income"
              ? "bg-lime text-ink shadow-brutal-sm"
              : "bg-white text-ink/60 hover:bg-yellow-soft hover:shadow-brutal-xs"
          }`}
        >
          Pemasukan
        </button>
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`${toggleBase} ${
            type === "expense"
              ? "bg-pink text-ink shadow-brutal-sm"
              : "bg-white text-ink/60 hover:bg-yellow-soft hover:shadow-brutal-xs"
          }`}
        >
          Pengeluaran
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="amount" className={labelClass}>
            Nominal (Rp)
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="any"
            placeholder="150000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Kategori
          </label>
          <input
            id="category"
            type="text"
            placeholder="Makan, Gaji, Transport..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="date" className={labelClass}>
            Tanggal
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Deskripsi{" "}
            <span className="font-medium text-ink/50">(opsional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Catatan tambahan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-brutal border-[3px] border-ink bg-pink px-4 py-3 text-sm font-bold text-ink shadow-brutal-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-7 w-full rounded-brutal border-[3px] border-ink bg-yellow px-6 py-4 text-sm font-bold tracking-[0.1em] text-ink uppercase shadow-brutal transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-[5px] active:translate-y-[5px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Menyimpan..." : "Simpan Transaksi"}
      </button>
    </form>
  );
}
