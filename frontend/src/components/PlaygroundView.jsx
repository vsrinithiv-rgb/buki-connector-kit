import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CornerDownLeft, Loader2, Sparkles } from 'lucide-react';
import ConnectorMetricGrid from './playground/ConnectorMetricGrid';
import AtlasRecordTable from './playground/AtlasRecordTable';
import PipelineStepperCard from './playground/PipelineStepperCard';

const QUICK_PROMPTS = [
  { label: 'Show connector metrics', widget: 'metrics' },
  { label: 'Query MongoDB Atlas logs', widget: 'atlas' },
  { label: 'Trace Workspace Docs pipeline', widget: 'pipeline' },
];

function inferWidgetAndReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('atlas') || lower.includes('record') || lower.includes('table') || lower.includes('log')) {
    return {
      widgetType: 'atlas',
      reply:
        'Fetched recent **MongoDB Atlas** `QueryLog` entries via the Atlas connector. Rendered `<AtlasRecordTable />` with live search filtering on the Visual UI Stage.',
    };
  }
  if (lower.includes('pipeline') || lower.includes('sync') || lower.includes('step') || lower.includes('ingest')) {
    return {
      widgetType: 'pipeline',
      reply:
        'Inspected the active ingestion pipeline (`Source → Auth Middleware → Schema Mapper → Sage Context Store`). Rendered `<PipelineStepperCard />` on the right.',
    };
  }
  return {
    widgetType: 'metrics',
    reply:
      'Aggregated live connector health, average latency, and Bearer auth success rate. Rendered `<ConnectorMetricGrid />` on the Visual UI Stage.',
  };
}

export default function PlaygroundView({
  messages,
  onSendMessage,
  connectors,
  atlasRecords,
  pipelines,
  logs,
}) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeWidget, setActiveWidget] = useState(
    messages[messages.length - 1]?.widgetType || 'metrics'
  );

  async function handleSubmitPrompt(promptText) {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    setInput('');
    setLoading(true);

    const { widgetType, reply } = inferWidgetAndReply(trimmed);
    await onSendMessage({
      prompt: trimmed,
      reply,
      widgetType,
    });

    setActiveWidget(widgetType);
    setLoading(false);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Live Assistant Playground
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Test Sage prompts through Buki connectors and inspect dynamic UI components rendered on the stage.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 p-1 text-xs">
          {[
            { id: 'metrics', label: 'Metrics' },
            { id: 'atlas', label: 'Atlas Table' },
            { id: 'pipeline', label: 'Pipeline Stepper' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveWidget(tab.id)}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                activeWidget === tab.id
                  ? 'bg-zinc-800 text-emerald-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-[540px] flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Pane: Interactive Chat */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Sparkles size={14} className="text-emerald-400" />
              Sage Connector Chat
            </span>
            <span className="font-mono text-[11px] text-zinc-500">POST /api/query</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 font-medium text-zinc-950'
                      : 'border border-zinc-800 bg-zinc-950 text-zinc-200'
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.latencyMs && (
                  <span className="mt-1 font-mono text-[10px] text-zinc-500">
                    {msg.timestamp} · {msg.latencyMs} ms · widget: {msg.widgetType}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
                <Loader2 size={13} className="animate-spin text-emerald-400" />
                Routing through SageConnector...
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800/80 p-3">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSubmitPrompt(item.label)}
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitPrompt(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Sage to render metrics, Atlas records, or pipeline status..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                Send
                <CornerDownLeft size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Pane: Visual UI Stage */}
        <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <span className="text-xs font-semibold text-zinc-200">
              Visual UI Stage
            </span>
            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
              active: {activeWidget}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeWidget === 'metrics' && (
              <ConnectorMetricGrid connectors={connectors} logs={logs} />
            )}
            {activeWidget === 'atlas' && (
              <AtlasRecordTable records={atlasRecords} />
            )}
            {activeWidget === 'pipeline' && (
              <PipelineStepperCard pipeline={pipelines[0]} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
