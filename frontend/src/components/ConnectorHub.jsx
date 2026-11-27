import { useState } from 'react';
import {
  Bot,
  Database,
  Eye,
  EyeOff,
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

function ConfigModal({ connector, onClose, onSave }) {
  const [endpointUrl, setEndpointUrl] = useState(connector.endpointUrl);
  const [bearerToken, setBearerToken] = useState(connector.bearerToken);
  const [showToken, setShowToken] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    onSave(connector.id, {
      endpointUrl: endpointUrl.trim(),
      bearerToken: bearerToken.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Configure {connector.name}
            </h3>
            <p className="text-xs text-zinc-400">{connector.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              API Endpoint URL
            </label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-100 outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Bearer Token / Secret Key
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-10 font-mono text-xs text-zinc-100 outline-none focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                title={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              Save Configuration
            </button>
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
