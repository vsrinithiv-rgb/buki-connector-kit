import { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Database,
  FileText,
  Gauge,
  RefreshCw,
  Server,
  Settings2,
  Webhook,
  X,
} from 'lucide-react';

const CONNECTOR_ICONS = {
  'sage-assistant': Bot,
  'mongodb-atlas': Database,
  'rest-webhooks': Webhook,
  'workspace-docs': FileText,
  'legacy-erp': Server,
};

function StatusBadge({ status }) {
  if (status === 'Connected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Connected
      </span>
    );
  }
  if (status === 'Syncing') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        Syncing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
      Disconnected
    </span>
  );
}

const SYNC_OPTIONS = [
  { key: 'realtimeSync', label: 'Real-time Sync', desc: 'Stream updates immediately on webhook or query events' },
  { key: 'hourlyBatchReconciliation', label: 'Hourly Batch Reconciliation', desc: 'Verify missed records and checksums every 60 minutes' },
  { key: 'dailyLedgerDigest', label: 'Daily Ledger Digest', desc: 'Compile daily audit summary for Sage Context Store' },
];

function ConfigModal({ connector, onClose, onSave }) {
  const initialSync = {
    realtimeSync: connector.syncFrequencies?.realtimeSync ?? true,
    hourlyBatchReconciliation: connector.syncFrequencies?.hourlyBatchReconciliation ?? false,
    dailyLedgerDigest: connector.syncFrequencies?.dailyLedgerDigest ?? true,
  };

  const [syncFrequencies, setSyncFrequencies] = useState(initialSync);

  const isDirty =
    syncFrequencies.realtimeSync !== initialSync.realtimeSync ||
    syncFrequencies.hourlyBatchReconciliation !== initialSync.hourlyBatchReconciliation ||
    syncFrequencies.dailyLedgerDigest !== initialSync.dailyLedgerDigest;

  function handleToggleFrequency(key) {
    setSyncFrequencies((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(connector.id, { syncFrequencies });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-dark-outline-variant bg-dark-surface-container-low shadow-2xl">
        <div className="flex items-center justify-between border-b border-dark-outline-variant px-5 py-4">
          <div>
            <h3 className="font-headline text-sm font-semibold text-dark-on-surface">
              Configure {connector.name}
            </h3>
            <p className="text-xs text-dark-outline">{connector.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-dark-outline hover:bg-dark-surface-container hover:text-dark-on-surface"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-2 rounded-lg border border-dark-outline-variant bg-dark-surface-container p-3">
            <div className="text-xs font-medium text-dark-on-surface">
              Automated Sync Frequency
            </div>
            {SYNC_OPTIONS.map((opt) => {
              const checked = syncFrequencies[opt.key];
              return (
                <label
                  key={opt.key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-1.5 py-1 hover:bg-dark-surface-container-high"
                >
                  <div>
                    <div className="text-xs font-medium text-dark-on-surface">{opt.label}</div>
                    <div className="text-[11px] text-dark-outline">{opt.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleFrequency(opt.key)}
                    className="h-4 w-4 rounded border-dark-outline-variant bg-dark-surface-container-lowest text-dark-primary focus:ring-0"
                  />
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="min-h-[20px]">
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                  <AlertTriangle size={13} />
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-dark-outline-variant bg-dark-surface-container px-3.5 py-2 text-xs font-medium text-dark-on-surface-variant hover:bg-dark-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-dark-primary px-3.5 py-2 text-xs font-semibold text-dark-on-primary hover:opacity-90"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConnectorHub({
  connectors,
  onToggleConnector,
  onSyncConnector,
  onSaveConfig,
}) {
  const [editingConnector, setEditingConnector] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Connector Hub
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage live bridges, endpoints, and Bearer credentials feeding the Sage Internal Assistant.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 font-mono text-xs text-zinc-300">
          <span className="text-emerald-400">
            {connectors.filter((c) => c.status === 'Connected').length} online
          </span>
          <span className="text-zinc-600">|</span>
          <span>
            avg{' '}
            {Math.round(
              connectors.reduce((sum, c) => sum + c.latencyMs, 0) / connectors.length
            )}{' '}
            ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {connectors.map((connector) => {
          const Icon = CONNECTOR_ICONS[connector.id] || Server;
          const isSyncing = connector.status === 'Syncing';

          return (
            <div
              key={connector.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-emerald-400">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100">
                        {connector.name}
                      </h2>
                      <p className="text-xs text-zinc-500">{connector.category}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={connector.enabled}
                    aria-label={`Toggle ${connector.name}`}
                    onClick={() => onToggleConnector(connector.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      connector.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-zinc-950 transition-transform ${
                        connector.enabled ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  {connector.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusBadge status={connector.status} />
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-0.5 font-mono text-[11px] text-zinc-300">
                    <Gauge size={11} className="text-zinc-500" />
                    {connector.latencyMs} ms
                  </span>
                </div>

                <div className="mt-3 truncate rounded-md border border-zinc-800/80 bg-zinc-950/80 px-2.5 py-1.5 font-mono text-[11px] text-zinc-500">
                  {connector.endpointUrl}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3.5">
                <span className="text-[11px] text-zinc-500">
                  Synced: {connector.lastSynced}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!connector.enabled || isSyncing}
                    onClick={() => onSyncConnector(connector.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing' : 'Sync Now'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingConnector(connector)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
                  >
                    <Settings2 size={12} />
                    Configure
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingConnector && (
        <ConfigModal
          connector={editingConnector}
          onClose={() => setEditingConnector(null)}
          onSave={(id, updates) => {
            onSaveConfig(id, updates);
            setEditingConnector(null);
          }}
        />
      )}
    </div>
  );
}
