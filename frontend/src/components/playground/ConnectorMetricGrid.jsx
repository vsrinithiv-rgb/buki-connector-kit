import { Activity, ArrowUpRight, CheckCircle2, Clock, PlugZap } from 'lucide-react';

export default function ConnectorMetricGrid({ connectors, logs }) {
  const onlineCount = connectors.filter((c) => c.status === 'Connected').length;
  const avgLatency = Math.round(
    connectors.reduce((acc, c) => acc + c.latencyMs, 0) / Math.max(connectors.length, 1)
  );
  const okLogs = logs.filter((l) => l.statusCode >= 200 && l.statusCode < 400).length;
  const successRate = logs.length ? Math.round((okLogs / logs.length) * 100) : 100;

  const cards = [
    {
      label: 'Active Connectors',
      value: `${onlineCount} / ${connectors.length}`,
      delta: 'Healthy mesh',
      icon: PlugZap,
      accent: 'text-emerald-400',
    },
    {
      label: 'Avg Connector Latency',
      value: `${avgLatency} ms`,
      delta: 'Under 3,000 ms SLA',
      icon: Clock,
      accent: 'text-sky-400',
    },
    {
      label: 'Auth & Query Success',
      value: `${successRate}%`,
      delta: `${okLogs}/${logs.length} requests OK`,
      icon: CheckCircle2,
      accent: 'text-emerald-400',
    },
    {
      label: 'Throughput (RPM)',
      value: `${connectors.reduce((sum, c) => sum + c.requestsPerMin, 0)}`,
      delta: '+14% vs last hr',
      icon: Activity,
      accent: 'text-violet-400',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            &lt;ConnectorMetricGrid /&gt;
          </h3>
          <p className="text-xs text-zinc-500">
            Real-time KPI snapshot synthesized from Buki connectors
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
          Live <ArrowUpRight size={12} />
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{card.label}</span>
                <Icon size={15} className={card.accent} />
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold text-zinc-100">
                {card.value}
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">{card.delta}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
