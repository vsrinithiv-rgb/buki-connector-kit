import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ConnectorHub from './components/ConnectorHub';
import PlaygroundView from './components/PlaygroundView';
import PipelinesView from './components/PipelinesView';
import TokensView from './components/TokensView';
import LogsView from './components/LogsView';
import {
  INITIAL_ATLAS_RECORDS,
  INITIAL_CONNECTORS,
  INITIAL_LOGS,
  INITIAL_PIPELINES,
  INITIAL_PLAYGROUND_MESSAGES,
  INITIAL_TOKENS,
} from './data/mockControlPlane';
import { submitSageQuery } from './services/api';

function formatNowTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 8) + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

function generateBearerToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 24; i += 1) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `buki_live_${rand}`;
}

export default function App() {
  const [activeView, setActiveView] = useState('connectors');
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);
  const [pipelines, setPipelines] = useState(INITIAL_PIPELINES);
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [atlasRecords, setAtlasRecords] = useState(INITIAL_ATLAS_RECORDS);
  const [messages, setMessages] = useState(INITIAL_PLAYGROUND_MESSAGES);
  const [streaming, setStreaming] = useState(true);

  const appendLog = useCallback((entry) => {
    setLogs((prev) => [
      {
        id: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: formatNowTime(),
        ...entry,
      },
      ...prev.slice(0, 79),
    ]);
  }, []);

  // Live-streaming telemetry heartbeat when enabled
  useEffect(() => {
    if (!streaming) return undefined;

    const interval = setInterval(() => {
      const sampleEndpoints = [
        {
          method: 'GET',
          endpoint: '/api/health',
          statusCode: 200,
          durationMs: 11 + Math.floor(Math.random() * 14),
          headers: { Accept: 'application/json', 'User-Agent': 'Buki-Monitor/1.0' },
          payload: null,
          response: { ok: true, service: 'buki-sage-backend', timeoutMs: 3000 },
        },
        {
          method: 'POST',
          endpoint: '/api/webhooks/ingest',
          statusCode: 202,
          durationMs: 35 + Math.floor(Math.random() * 30),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer whsec_buki_••••9c8d',
          },
          payload: { event: 'docs.reindex', batchSize: 12 },
          response: { accepted: true, queued: 12 },
        },
      ];
      const pick = sampleEndpoints[Math.floor(Math.random() * sampleEndpoints.length)];
      appendLog(pick);
    }, 6000);

    return () => clearInterval(interval);
  }, [streaming, appendLog]);

  function handleToggleConnector(id) {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextEnabled = !c.enabled;
        const nextStatus = nextEnabled ? 'Connected' : 'Disconnected';
        appendLog({
          method: 'PATCH',
          endpoint: `/api/connectors/${id}/power`,
          statusCode: 200,
          durationMs: 18,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens[0]?.token?.slice(0, 12) || 'buki-dev'}••••`,
          },
          payload: { enabled: nextEnabled },
          response: { ok: true, id, status: nextStatus },
        });
        return {
          ...c,
          enabled: nextEnabled,
          status: nextStatus,
        };
      })
    );
  }

  function handleSyncConnector(id) {
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'Syncing', lastSynced: 'Syncing now...' } : c
      )
    );

    setTimeout(() => {
      const nextLatency = 24 + Math.floor(Math.random() * 55);
      setConnectors((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            status: c.enabled ? 'Connected' : 'Disconnected',
            latencyMs: nextLatency,
            lastSynced: 'Just now',
          };
        })
      );

      appendLog({
        method: 'POST',
        endpoint: `/api/connectors/${id}/sync`,
        statusCode: 200,
        durationMs: nextLatency,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens[0]?.token?.slice(0, 12) || 'buki-dev'}••••`,
        },
        payload: { trigger: 'manual' },
        response: { ok: true, synced: true, latencyMs: nextLatency },
      });
    }, 950);
  }

  function handleSaveConfig(id, { endpointUrl, bearerToken }) {
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, endpointUrl, bearerToken } : c))
    );
    appendLog({
      method: 'PUT',
      endpoint: `/api/connectors/${id}/config`,
      statusCode: 200,
      durationMs: 22,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens[0]?.token?.slice(0, 12) || 'buki-dev'}••••`,
      },
      payload: { endpointUrl, bearerToken: '••••••••' },
      response: { ok: true, updated: id },
    });
  }

  function handleRunPipeline(id) {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'Running', progress: 15, activeStageIndex: 0, lastRun: 'In progress' }
          : p
      )
    );

    const steps = [
      { delay: 450, progress: 40, stage: 1 },
      { delay: 900, progress: 72, stage: 2 },
      { delay: 1400, progress: 100, stage: 3, done: true },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setPipelines((prev) =>
          prev.map((p) => {
            if (p.id !== id) return p;
            if (step.done) {
              return {
                ...p,
                status: 'Idle',
                progress: 100,
                activeStageIndex: 3,
                recordsProcessed: p.totalRecords,
                lastRun: 'Just now',
              };
            }
            return {
              ...p,
              progress: step.progress,
              activeStageIndex: step.stage,
            };
          })
        );

        if (step.done) {
          appendLog({
            method: 'POST',
            endpoint: `/api/pipelines/${id}/run`,
            statusCode: 200,
            durationMs: 1400,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokens[0]?.token?.slice(0, 12) || 'buki-dev'}••••`,
            },
            payload: { pipelineId: id, mode: 'manual' },
            response: { ok: true, status: 'completed', progress: 100 },
          });
        }
      }, step.delay);
    });
  }

  function handleCreateToken({ label, scopes }) {
    const newToken = {
      id: `tok_${Date.now()}`,
      name: label,
      token: generateBearerToken(),
      scopes,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastUsed: 'Never',
    };
    setTokens((prev) => [newToken, ...prev]);
    appendLog({
      method: 'POST',
      endpoint: '/api/auth/tokens',
      statusCode: 201,
      durationMs: 19,
      headers: { 'Content-Type': 'application/json' },
      payload: { name: label, scopes },
      response: { ok: true, id: newToken.id, scopes },
    });
  }

  function handleRevokeToken(id) {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    appendLog({
      method: 'DELETE',
      endpoint: `/api/auth/tokens/${id}`,
      statusCode: 200,
      durationMs: 14,
      headers: { 'Content-Type': 'application/json' },
      payload: null,
      response: { ok: true, revoked: id },
    });
  }

  async function handlePlaygroundMessage({ prompt, reply, widgetType }) {
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    setMessages((prev) => [...prev, userMsg]);

    const startedAt = performance.now();
    let finalContent = reply;
    let statusCode = 200;

    const activeToken = tokens[0]?.token || '';
    if (activeToken) {
      try {
        const res = await submitSageQuery({ query: prompt, token: activeToken });
        if (res?.data?.answer) {
          finalContent = `${reply}\n\n---\n${res.data.answer}`;
        }
      } catch {
        // Fallback smoothly to interactive control-plane mock response when backend is offline
      }
    }

    const latencyMs = Math.max(28, Math.round(performance.now() - startedAt));

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: finalContent,
        widgetType,
        timestamp: new Date().toTimeString().slice(0, 5),
        latencyMs,
      },
    ]);

    setAtlasRecords((prev) => [
      {
        id: `log_${Date.now()}`,
        userId: 'playground@buki.dev',
        query: prompt,
        provider: 'sage-mock',
        latencyMs,
        status: 'success',
        timestamp: new Date().toTimeString().slice(0, 8),
      },
      ...prev,
    ]);

    appendLog({
      method: 'POST',
      endpoint: '/api/query',
      statusCode,
      durationMs: latencyMs,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken ? `${activeToken.slice(0, 12)}••••` : 'none'}`,
      },
      payload: { query: prompt, stageWidget: widgetType },
      response: { ok: true, widgetType, latencyMs },
    });
  }

  const connectedCount = connectors.filter((c) => c.status === 'Connected').length;
  const activePipelinesCount = pipelines.filter((p) => p.status === 'Running').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-surface text-dark-on-surface">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        connectedCount={connectedCount}
        totalConnectors={connectors.length}
        activePipelinesCount={activePipelinesCount}
        logCount={logs.length}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {activeView === 'connectors' && (
          <ConnectorHub
            connectors={connectors}
            onToggleConnector={handleToggleConnector}
            onSyncConnector={handleSyncConnector}
            onSaveConfig={handleSaveConfig}
          />
        )}

        {activeView === 'playground' && (
          <PlaygroundView
            messages={messages}
            onSendMessage={handlePlaygroundMessage}
            connectors={connectors}
            atlasRecords={atlasRecords}
            pipelines={pipelines}
            logs={logs}
          />
        )}

        {activeView === 'pipelines' && (
          <PipelinesView
            pipelines={pipelines}
            onRunPipeline={handleRunPipeline}
          />
        )}

        {activeView === 'tokens' && (
          <TokensView
            tokens={tokens}
            onCreateToken={handleCreateToken}
            onRevokeToken={handleRevokeToken}
            onLogEvent={appendLog}
          />
        )}

        {activeView === 'logs' && (
          <LogsView
            logs={logs}
            streaming={streaming}
            onToggleStreaming={() => setStreaming((prev) => !prev)}
          />
        )}
      </main>
    </div>
  );
}
