import { formatRupiah } from "../lib/format";

const thClass =
  "border-b-[3px] border-ink bg-yellow px-4 py-3 text-left text-[11px] font-bold tracking-[0.15em] text-ink uppercase";

export default function TransactionList({ transactions, onDelete, loading }) {
  return (
    <div className="rounded-brutal border-[3px] border-ink bg-white p-7 shadow-brutal">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink">
          Daftar Transaksi
        </h2>
        <span className="rounded-brutal border-2 border-ink bg-canvas px-2.5 py-1 text-[11px] font-bold tracking-widest text-ink uppercase shadow-brutal-xs">
          {transactions.length} entri
        </span>
      </div>

      {loading ? (
        <p className="mt-6 rounded-brutal border-[3px] border-dashed border-ink/40 px-6 py-14 text-center text-[11px] font-bold tracking-[0.15em] text-ink/60 uppercase">
          Memuat data...
        </p>
      ) : transactions.length === 0 ? (
        <p className="mt-6 rounded-brutal border-[3px] border-dashed border-ink/40 px-6 py-14 text-center text-[11px] font-bold tracking-[0.15em] text-ink/60 uppercase">
          Belum ada transaksi. Tambahkan yang pertama.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-brutal border-[3px] border-ink">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className={thClass}>Tanggal</th>
                <th className={thClass}>Kategori</th>
                <th className={thClass}>Deskripsi</th>
                <th className={`${thClass} text-right`}>Nominal</th>
                <th className={`${thClass} w-24`} />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const isIncome = t.type === "income";
                return (
                  <tr
                    key={t.id}
                    className="border-b-2 border-ink transition last:border-b-0 hover:bg-yellow-soft"
                  >
                    <td className="px-4 py-4 font-medium whitespace-nowrap text-ink/70">
                      {t.date}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-brutal border-2 border-ink px-2.5 py-1 text-[11px] font-bold tracking-wider text-ink uppercase shadow-brutal-xs ${
                          isIncome ? "bg-lime" : "bg-pink"
                        }`}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td
                      className="max-w-56 truncate px-4 py-4 font-medium text-ink/70"
                      title={t.description || ""}
                    >
                      {t.description || "—"}
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-display font-bold whitespace-nowrap ${
                        isIncome ? "text-lime-dark" : "text-pink-dark"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatRupiah(Number(t.amount))}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => onDelete(t.id)}
                        className="rounded-brutal border-2 border-ink bg-pink px-3 py-1.5 text-[11px] font-bold tracking-wider text-ink uppercase shadow-brutal-xs transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
