import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CornerDownLeft, LayoutTemplate, Loader2, Terminal } from 'lucide-react';
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
        'Inspected the active ingestion pipeline (`Source -> Auth Middleware -> Schema Mapper -> Sage Context Store`). Rendered `<PipelineStepperCard />` on the right.',
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
  const [activeWidget, setActiveWidget] = useState('all');

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
          <h1 className="font-headline text-xl font-semibold tracking-tight text-dark-on-surface">
            Live Assistant Playground
          </h1>
          <p className="mt-1 text-sm text-dark-on-surface-variant">
            Test Sage prompts through Buki connectors and inspect dynamic UI components rendered on the stage.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-dark-outline-variant bg-dark-surface-container-low p-1 font-mono text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'metrics', label: 'MetricGrid' },
            { id: 'atlas', label: 'AtlasTable' },
            { id: 'pipeline', label: 'PipelineStepper' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveWidget(tab.id)}
              className={`rounded px-2.5 py-1 font-medium transition ${
                activeWidget === tab.id
                  ? 'bg-dark-primary text-dark-on-primary'
                  : 'text-dark-on-surface-variant hover:text-dark-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-[540px] flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Pane: Interactive Chat */}
        <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-dark-outline-variant bg-dark-surface-container lg:col-span-5">
          <div className="flex items-center justify-between border-b border-dark-outline-variant bg-dark-surface-container-low px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-dark-on-surface">
              <Terminal size={14} className="text-dark-primary" />
              Sage Prompt Console
            </span>
            <span className="font-mono text-[11px] text-success">Connected</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => msg.widgetType && setActiveWidget(msg.widgetType)}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-dark-surface-container-high border border-dark-outline-variant text-dark-on-surface'
                      : 'cursor-pointer border border-dark-outline-variant bg-dark-surface-container-low text-dark-on-surface-variant hover:border-dark-primary'
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.latencyMs && (
                  <span className="mt-1 font-mono text-[10px] text-dark-outline">
                    {msg.timestamp} · {msg.latencyMs} ms · widget: {msg.widgetType}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-dark-outline-variant bg-dark-surface-container-low px-3 py-2 text-xs text-dark-on-surface-variant">
                <Loader2 size={13} className="animate-spin text-dark-primary" />
                Routing through SageConnector...
              </div>
            )}
          </div>

          <div className="border-t border-dark-outline-variant bg-dark-surface-container-low p-3">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSubmitPrompt(item.label)}
                  className="rounded-md border border-dark-outline-variant bg-dark-surface-container px-2.5 py-1 text-[11px] text-dark-on-surface-variant hover:border-dark-primary hover:text-dark-primary"
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
                className="flex-1 rounded-lg border border-dark-outline-variant bg-dark-surface-container-lowest px-3 py-2 text-xs text-dark-on-surface placeholder:text-dark-outline outline-none focus:border-dark-primary"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-dark-primary px-3 py-2 text-xs font-semibold text-dark-on-primary hover:opacity-90 disabled:opacity-50"
              >
                Send
                <CornerDownLeft size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Pane: Visual UI Stage */}
        <div className="flex flex-col rounded-xl border border-dark-outline-variant bg-dark-surface-container-low p-4 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between border-b border-dark-outline-variant pb-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-dark-on-surface">
              <LayoutTemplate size={14} className="text-dark-primary" />
              Visual UI Stage
            </span>
            <span className="rounded-md border border-dark-outline-variant bg-dark-surface-container px-2 py-0.5 font-mono text-[10px] text-dark-outline">
              active: {activeWidget}
            </span>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto">
            {(activeWidget === 'all' || activeWidget === 'metrics') && (
              <ConnectorMetricGrid connectors={connectors} logs={logs} />
            )}
            {(activeWidget === 'all' || activeWidget === 'atlas') && (
              <AtlasRecordTable records={atlasRecords} />
            )}
            {(activeWidget === 'all' || activeWidget === 'pipeline') && (
              <PipelineStepperCard pipeline={pipelines[0]} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
