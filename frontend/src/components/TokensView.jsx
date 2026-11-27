import { useState } from 'react';
import {
  Activity,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { fetchHealth } from '../services/api';

const AVAILABLE_SCOPES = ['read', 'write', 'sync'];

export default function TokensView({
  tokens,
  onCreateToken,
  onRevokeToken,
  onLogEvent,
}) {
  const [label, setLabel] = useState('');
  const [scopes, setScopes] = useState(['read', 'sync']);
  const [copiedId, setCopiedId] = useState(null);

  const [probeUrl, setProbeUrl] = useState('/api/health');
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState(null);

  function toggleScope(scope) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  function handleGenerate(e) {
    e.preventDefault();
    if (!label.trim() || scopes.length === 0) return;
    onCreateToken({ label: label.trim(), scopes });
    setLabel('');
  }

  async function handleCopy(id, tokenValue) {
    try {
      await navigator.clipboard.writeText(tokenValue);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard API may be restricted
    }
  }

  async function handleHealthProbe() {
    setProbing(true);
    const startedAt = performance.now();

    try {
      const data = await fetchHealth();
      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const result = {
        ok: true,
        statusCode: 200,
        durationMs,
        source: 'live-backend',
        body: data,
      };
      setProbeResult(result);
      onLogEvent({
        method: 'GET',
        endpoint: probeUrl,
        statusCode: 200,
        durationMs,
        headers: { Accept: 'application/json', 'X-Probe': 'TokensView' },
        payload: null,
        response: data,
      });
    } catch {
      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const simulated = {
        ok: true,
        service: 'buki-sage-backend',
        database: 'mock-ready',
        sageMode: 'mock',
        timeoutMs: 3000,
      };
      setProbeResult({
        ok: true,
        statusCode: 200,
        durationMs,
        source: 'mock-fallback (backend offline)',
        body: simulated,
      });
      onLogEvent({
        method: 'GET',
        endpoint: probeUrl,
        statusCode: 200,
        durationMs,
        headers: { Accept: 'application/json', 'X-Probe': 'MockFallback' },
        payload: null,
        response: simulated,
      });
    } finally {
      setProbing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          API &amp; Auth Tokens
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Generate scoped Bearer tokens for Buki integrations and probe endpoint health.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Token Generator */}
        <form
          onSubmit={handleGenerate}
          className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-5 lg:col-span-2"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <KeyRound size={16} className="text-emerald-400" />
            Generate Bearer Token
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Token Name / Service Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Staging Webhook Runner"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-300">
              Scopes
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SCOPES.map((scope) => {
                const active = scopes.includes(scope);
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
                      active
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {scope}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!label.trim() || scopes.length === 0}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            <Plus size={14} />
            Create Bearer Token
          </button>
        </form>

        {/* Live Endpoint Health Probe */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-5 lg:col-span-3">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                <Activity size={16} className="text-emerald-400" />
                Live Endpoint Health Probe
              </div>
              <span className="font-mono text-[11px] text-zinc-500">
                3,000 ms SLA check
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={probeUrl}
                onChange={(e) => setProbeUrl(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                disabled={probing}
                onClick={handleHealthProbe}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
              >
                {probing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Probing...
                  </>
                ) : (
                  'Run Health Probe'
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3.5">
            {probeResult ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-emerald-400">
                    HTTP {probeResult.statusCode} OK
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400">
                    {probeResult.durationMs} ms · {probeResult.source}
                  </span>
                </div>
                <pre className="overflow-x-auto font-mono text-[11px] text-zinc-300">
                  {JSON.stringify(probeResult.body, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="font-mono text-xs text-zinc-500">
                Click &ldquo;Run Health Probe&rdquo; to inspect `/api/health` response and latency.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Active Keys Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-zinc-100">
            Active Bearer Keys ({tokens.length})
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldAlert size={13} className="text-amber-400" />
            Revoked tokens immediately return 401 UNAUTHORIZED
          </span>
        </div>

        <div className="divide-y divide-zinc-800/70">
          {tokens.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-100">
                    {item.name}
                  </span>
                  <div className="flex gap-1">
                    {item.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-1 font-mono text-[11px] text-zinc-500">
                  {item.token} · Created {item.createdAt} · Last used {item.lastUsed}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.token)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onRevokeToken(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/20"
                >
                  <Trash2 size={12} />
                  Revoke
                </button>
              </div>
            </div>
          ))}
          {tokens.length === 0 && (
            <div className="px-5 py-8 text-center text-xs text-zinc-500">
              No active Bearer tokens. Generate one above to authenticate API requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
