import { ArrowRight, CheckCircle2, Loader2, Play, Workflow } from 'lucide-react';

export default function PipelinesView({ pipelines, onRunPipeline }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Data Sync &amp; Pipelines
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Visual node-to-node ingestion flows from external sources into the Sage Context Store.
        </p>
      </div>

      <div className="space-y-4">
        {pipelines.map((pipeline) => {
          const isRunning = pipeline.status === 'Running';

          return (
            <div
              key={pipeline.id}
              className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-emerald-400">
                    <Workflow size={17} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                      {pipeline.name}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Schedule: {pipeline.schedule} · Last run: {pipeline.lastRun}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-400">
                    {pipeline.recordsProcessed.toLocaleString()} /{' '}
                    {pipeline.totalRecords.toLocaleString()} records
                  </span>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => onRunPipeline(pipeline.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        Run Pipeline
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Progress Bar */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-zinc-400">
                    Status:{' '}
                    <span className={isRunning ? 'text-amber-300' : 'text-emerald-300'}>
                      {pipeline.status}
                    </span>
                  </span>
                  <span className="font-mono text-zinc-300">{pipeline.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isRunning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pipeline.progress}%` }}
                  />
                </div>
              </div>

              {/* Visual Node-to-Node Flow */}
              <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
                {pipeline.stages.map((stage, idx) => {
                  const isDone =
                    pipeline.status === 'Idle' || idx < pipeline.activeStageIndex;
                  const isCurrent = isRunning && idx === pipeline.activeStageIndex;

                  return (
                    <div key={stage.key} className="contents">
                      <div
                        className={`rounded-lg border p-3 transition ${
                          isCurrent
                            ? 'border-amber-500/40 bg-amber-500/10'
                            : isDone
                              ? 'border-emerald-500/25 bg-zinc-950/90'
                              : 'border-zinc-800 bg-zinc-950/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-zinc-100">
                            {stage.label}
                          </span>
                          {isDone ? (
                            <CheckCircle2 size={13} className="text-emerald-400" />
                          ) : isCurrent ? (
                            <Loader2 size={13} className="animate-spin text-amber-400" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-zinc-700" />
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-400">{stage.detail}</p>
                      </div>

                      {idx < pipeline.stages.length - 1 && (
                        <div className="hidden justify-center text-zinc-600 md:flex">
                          <ArrowRight size={15} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
