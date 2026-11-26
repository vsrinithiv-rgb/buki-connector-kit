import {
  Activity,
  Blocks,
  GitBranch,
  KeyRound,
  MessageSquareCode,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'connectors', label: 'Connector Hub', icon: Blocks },
  { id: 'playground', label: 'Assistant Playground', icon: MessageSquareCode },
  { id: 'pipelines', label: 'Data Sync & Pipelines', icon: GitBranch },
  { id: 'tokens', label: 'API & Auth Tokens', icon: KeyRound },
  { id: 'logs', label: 'Logs & Telemetry', icon: Activity },
];

export default function Sidebar({
  activeView,
  onSelectView,
  connectedCount,
  totalConnectors,
  activePipelinesCount,
  logCount,
}) {
  function getBadge(id) {
    if (id === 'connectors') return `${connectedCount}/${totalConnectors}`;
    if (id === 'pipelines' && activePipelinesCount > 0) return `${activePipelinesCount} active`;
    if (id === 'logs') return String(logCount);
    return null;
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950">
      <div className="flex items-center gap-3 border-b border-zinc-800/80 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <Terminal size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-zinc-100">
            Buki Connector Kit
          </div>
          <div className="text-[11px] font-mono text-zinc-500">Sage Control Plane v1.0</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const badge = getBadge(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-800/90 font-medium text-zinc-100 shadow-sm ring-1 ring-zinc-700/70'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={isActive ? 'text-emerald-400' : 'text-zinc-500'}
                />
                <span>{item.label}</span>
              </span>
              {badge && (
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800/80 p-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
              <ShieldCheck size={14} className="text-emerald-400" />
              SLA Guard Active
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-zinc-500">
            Timeout: 3,000 ms · Bearer Auth
          </p>
        </div>
      </div>
    </aside>
  );
}
