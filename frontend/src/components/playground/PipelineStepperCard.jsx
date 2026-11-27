import { CheckCircle2, CircleDot, Clock } from 'lucide-react';

export default function PipelineStepperCard({ pipeline }) {
  if (!pipeline) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            &lt;PipelineStepperCard /&gt;
          </h3>
          <p className="text-xs text-zinc-500">{pipeline.name}</p>
        </div>
        <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
          {pipeline.progress}%
        </span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4">
        <div className="space-y-3.5">
          {pipeline.stages.map((stage, idx) => {
            const isComplete =
              pipeline.status === 'Idle' || idx < pipeline.activeStageIndex;
            const isCurrent =
              pipeline.status === 'Running' && idx === pipeline.activeStageIndex;

            return (
              <div key={stage.key} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isComplete ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isCurrent ? (
                    <CircleDot size={16} className="animate-pulse text-amber-400" />
                  ) : (
                    <Clock size={16} className="text-zinc-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isComplete
                          ? 'text-zinc-100'
                          : isCurrent
                            ? 'text-amber-300'
                            : 'text-zinc-500'
                      }`}
                    >
                      {idx + 1}. {stage.label}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {isComplete ? 'Done' : isCurrent ? 'Executing' : 'Queued'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">{stage.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
