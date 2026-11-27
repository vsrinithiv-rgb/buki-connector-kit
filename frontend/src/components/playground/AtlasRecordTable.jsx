import { useState } from 'react';
import { Database, Search } from 'lucide-react';

export default function AtlasRecordTable({ records }) {
  const [search, setSearch] = useState('');

  const filtered = records.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      row.query.toLowerCase().includes(q) ||
      row.userId.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q) ||
      row.provider.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            &lt;AtlasRecordTable /&gt;
          </h3>
          <p className="text-xs text-zinc-500">
            MongoDB Atlas <code className="font-mono text-zinc-300">QueryLog</code> collection
          </p>
        </div>

        <div className="relative w-full sm:w-56">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter query, user, status..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 pl-8 pr-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/70 text-[11px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3.5 py-2.5">User</th>
                <th className="px-3.5 py-2.5">Query</th>
                <th className="px-3.5 py-2.5">Latency</th>
                <th className="px-3.5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-900/40">
                  <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[11px] text-zinc-400">
                    {row.userId}
                  </td>
                  <td className="max-w-xs truncate px-3.5 py-2.5 text-zinc-200">
                    {row.query}
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[11px] text-zinc-300">
                    {row.latencyMs} ms
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] ${
                        row.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : 'bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-zinc-500">
                    <Database size={16} className="mx-auto mb-1.5 text-zinc-600" />
                    No Atlas records match &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
