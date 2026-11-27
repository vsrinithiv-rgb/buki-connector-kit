import { useState } from 'react';
import { Pause, Play, Radio } from 'lucide-react';

function statusBadgeClass(code) {
  if (code >= 200 && code < 300) {
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  }
  if (code >= 400 && code < 500) {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  }
  return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
}

export default function LogsView({
  logs,
  streaming,
  onToggleStreaming,
}) {
  const [selectedLogId, setSelectedLogId] = useState(logs[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = logs.filter((entry) => {
    if (statusFilter === '2xx') return entry.statusCode >= 200 && entry.statusCode < 300;
    if (statusFilter === '4xx/5xx') return entry.statusCode >= 400;
    return true;
  });

  const selectedLog =
    logs.find((l) => l.id === selectedLogId) || filteredLogs[0] || null;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Logs &amp; Telemetry
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Live-streaming HTTP &amp; Webhook request stream with JSON payload and Auth header inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/70 p-1 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: '2xx', label: '2xx' },
              { id: '4xx/5xx', label: 'Errors' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 font-medium ${
                  statusFilter === tab.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleStreaming}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              streaming
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            }`}
          >
            {streaming ? <Pause size={13} /> : <Play size={13} />}
            {streaming ? 'Live Stream On' : 'Stream Paused'}
          </button>
        </div>
      </div>

      <div className="grid min-h-[520px] flex-1 grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left: Log Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900/40 xl:col-span-7">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 text-xs text-zinc-400">
            <span className="flex items-center gap-2 font-medium text-zinc-200">
              <Radio
                size={13}
                className={streaming ? 'animate-pulse text-emerald-400' : 'text-zinc-500'}
              />
              HTTP / Webhook Events ({filteredLogs.length})
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              Click a row to inspect
            </span>
          </div>

          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-zinc-800 bg-zinc-950 font-mono text-[11px] uppercase text-zinc-500">
                <tr>
                  <th className="px-3.5 py-2.5">Time</th>
                  <th className="px-3.5 py-2.5">Method</th>
                  <th className="px-3.5 py-2.5">Endpoint</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                {filteredLogs.map((entry) => {
                  const isSelected = selectedLog?.id === entry.id;
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedLogId(entry.id)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-zinc-800/80' : 'hover:bg-zinc-900/60'
                      }`}
                    >
                      <td className="whitespace-nowrap px-3.5 py-2.5 text-zinc-400">
                        {entry.timestamp}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 font-semibold text-sky-400">
                        {entry.method}
                      </td>
                      <td className="max-w-[180px] truncate px-3.5 py-2.5 text-zinc-200">
                        {entry.endpoint}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5">
                        <span
                          className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold ${statusBadgeClass(
                            entry.statusCode
                          )}`}
                        >
                          {entry.statusCode}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 text-right text-zinc-300">
                        {entry.durationMs} ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Side-by-Side JSON Payload & Auth Header Inspector */}
        <div className="flex flex-col rounded-xl border border-zinc-800/90 bg-zinc-950 xl:col-span-5">
          <div className="border-b border-zinc-800 px-4 py-2.5">
            <h2 className="text-xs font-semibold text-zinc-200">
              JSON Payload &amp; Auth Header Inspector
            </h2>
          </div>

          {selectedLog ? (
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs">
                <span className="text-zinc-200">
                  {selectedLog.method} {selectedLog.endpoint}
                </span>
                <span className="text-zinc-400">{selectedLog.durationMs} ms</span>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Auth &amp; Request Headers
                </div>
                <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 font-mono text-[11px] text-emerald-300">
                  {JSON.stringify(selectedLog.headers, null, 2)}
                </pre>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Request JSON Payload
                </div>
                <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 font-mono text-[11px] text-zinc-200">
                  {selectedLog.payload
                    ? JSON.stringify(selectedLog.payload, null, 2)
                    : '// No request body (GET)'}
                </pre>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Response Body
                </div>
                <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 font-mono text-[11px] text-sky-300">
                  {JSON.stringify(selectedLog.response, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-xs text-zinc-500">
              Select a log row to inspect headers and JSON payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
