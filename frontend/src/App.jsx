import { useCallback, useEffect, useMemo, useState } from "react";
import SummaryCard from "./components/SummaryCard";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import BudgetCard from "./components/BudgetCard";
import AiChat from "./components/AiChat";
import { apiGet, apiPost, apiPut, apiDelete } from "./lib/api";

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [budget, setBudget] = useState(null);
  const [budgetLoaded, setBudgetLoaded] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);

  const [insight, setInsight] = useState(null);
  const [comment, setComment] = useState(null);
  const [chat, setChat] = useState([]);
  const [thinking, setThinking] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await apiGet("/transactions");
      setTransactions(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBudget = useCallback(async () => {
    try {
      const data = await apiGet("/budget");
      setBudget(data.amount);
    } catch (err) {
      setError(err.message);
    } finally {
      setBudgetLoaded(true);
    }
  }, []);

  const fetchInsight = useCallback(async () => {
    try {
      const data = await apiGet("/ai/insight");
      setInsight(data);
      setComment(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchChat = useCallback(async () => {
    try {
      const data = await apiGet("/chat?limit=30");
      setChat(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchBudget();
    fetchInsight();
    fetchChat();
  }, [fetchTransactions, fetchBudget, fetchInsight, fetchChat]);

  const analyze = useCallback(async () => {
    setThinking(true);
    try {
      const data = await apiPost("/ai/analyze", {});
      setInsight(data);
      setComment(data.chatMessage?.content || data.message);
      if (data.chatMessage) {
        setChat((prev) => [...prev, data.chatMessage]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setThinking(false);
    }
  }, []);

  const handleTransactionAdded = useCallback(async () => {
    await fetchTransactions();
    await analyze();
  }, [fetchTransactions, analyze]);

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await analyze();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveBudget = async (month, amount) => {
    setSavingBudget(true);
    try {
      const data = await apiPut("/budget", { month, amount });
      setBudget(data.amount);
      await fetchInsight();
    } finally {
      setSavingBudget(false);
    }
  };

  const handleSendMessage = async (message) => {
    setThinking(true);
    try {
      const { userMessage, assistantMessage } = await apiPost("/chat", {
        message,
      });
      setChat((prev) => [...prev, userMessage, assistantMessage]);
    } catch (err) {
      setError(err.message);
    } finally {
      setThinking(false);
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

        <BudgetCard
          budget={budget}
          insight={insight}
          loaded={budgetLoaded}
          saving={savingBudget}
          onSave={handleSaveBudget}
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TransactionForm onSuccess={handleTransactionAdded} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList
              transactions={transactions}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>

        <AiChat
          insight={insight}
          comment={comment}
          chat={chat}
          thinking={thinking}
          aiEnabled={Boolean(insight?.aiEnabled)}
          onSend={handleSendMessage}
        />
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-14 sm:px-8">
        <p className="border-t-[3px] border-ink pt-8 text-[11px] font-bold tracking-[0.2em] text-ink/60 uppercase">
          Finance Tracker — localhost
        </p>
      </footer>
    </div>
  );
}
