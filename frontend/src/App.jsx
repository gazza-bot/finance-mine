import { useCallback, useEffect, useMemo, useState } from "react";
import SummaryCard from "./components/SummaryCard";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";

const API_URL = "http://localhost:5000/api";

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`${API_URL}/transactions`);
      if (!res.ok) throw new Error("Gagal memuat transaksi");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus transaksi");
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const { income, expense, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b-4 border-ink bg-primary">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <span className="inline-block rounded-brutal border-2 border-ink bg-yellow px-3 py-1 text-xs font-bold tracking-[0.2em] text-ink uppercase shadow-brutal-xs">
            Finance Tracker
          </span>
          <h1 className="mt-6 font-display text-5xl leading-none font-bold text-white sm:text-6xl">
            Catat Keuanganmu.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-white/85">
            Pantau pemasukan dan pengeluaran dalam satu tempat yang sederhana.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-14 sm:px-8">
        <SummaryCard income={income} expense={expense} balance={balance} />

        {error && (
          <div className="flex items-center gap-3 rounded-brutal border-[3px] border-ink bg-pink px-5 py-4 shadow-brutal">
            <span className="rounded-brutal border-2 border-ink bg-ink px-2 py-0.5 text-[11px] font-bold tracking-widest text-white uppercase">
              Error
            </span>
            <p className="text-sm font-bold text-ink">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TransactionForm onSuccess={fetchTransactions} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList
              transactions={transactions}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-14 sm:px-8">
        <p className="border-t-[3px] border-ink pt-8 text-[11px] font-bold tracking-[0.2em] text-ink/60 uppercase">
          Finance Tracker — localhost
        </p>
      </footer>
    </div>
  );
}
