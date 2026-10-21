import { formatRupiah } from "../lib/format";

export default function SummaryCard({ income, expense, balance }) {
  const cards = [
    {
      label: "Total Pemasukan",
      value: income,
      accent: "text-lime",
      dot: "bg-lime",
    },
    {
      label: "Total Pengeluaran",
      value: expense,
      accent: "text-pink",
      dot: "bg-pink",
    },
    {
      label: "Sisa Saldo",
      value: balance,
      accent: balance >= 0 ? "text-lime" : "text-pink",
      dot: balance >= 0 ? "bg-lime" : "bg-pink",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-brutal border-[3px] border-ink bg-white p-7 shadow-brutal transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] leading-tight font-bold tracking-[0.15em] text-ink/70 uppercase">
              {card.label}
            </p>
            <span
              className={`h-4 w-4 shrink-0 border-2 border-ink ${card.dot}`}
            />
          </div>
          <p
            className={`mt-5 font-display text-3xl font-bold ${card.accent}`}
          >
            {formatRupiah(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
