import {
  Activity,
  Cpu,
  GitBranch,
  KeyRound,
  MessageSquareCode,
  PlugZap,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'connectors', label: 'Connector Hub', icon: PlugZap },
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
    <aside className="flex w-64 shrink-0 flex-col border-r border-dark-outline-variant bg-dark-surface-container-low">
      <div className="flex items-center gap-3 border-b border-dark-outline-variant px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-primary text-dark-on-primary">
          <Cpu size={18} />
        </div>
        <div>
          <div className="font-headline text-sm font-semibold tracking-tight text-dark-on-surface">
            Buki Connector Kit
          </div>
          <div className="font-mono text-[11px] text-dark-outline">Sage Control Plane v2.4</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-dark-outline">
          Control Plane
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
                  ? 'bg-dark-secondary-container font-medium text-dark-primary'
                  : 'text-dark-on-surface-variant hover:bg-dark-surface-container hover:text-dark-on-surface'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={isActive ? 'text-dark-primary' : 'text-dark-outline'}
                />
                <span>{item.label}</span>
              </span>
              {badge && (
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                    isActive
                      ? 'bg-dark-surface-container-low text-dark-primary'
                      : 'bg-dark-surface-container text-dark-outline'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-dark-outline-variant p-4">
        <div className="rounded-lg border border-dark-outline-variant bg-dark-surface-container p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-dark-on-surface">
              <ShieldCheck size={14} className="text-success" />
              Sage Gateway
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Online
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-dark-outline">
            Timeout: 3,000 ms · Bearer Auth
          </p>
        </div>
      </div>
    </aside>
  );
}
