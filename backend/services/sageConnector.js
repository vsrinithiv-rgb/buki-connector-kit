const crypto = require('crypto');
const defaultConfig = require('../config/env');

class SageServiceError extends Error {
  constructor(message, { statusCode = 502, code = 'SAGE_UPSTREAM_ERROR', details = null } = {}) {
    super(message);
    this.name = 'SageServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Builds deterministic contextual mock responses when SAGE_MOCK_MODE=true.
 * Allows local verification before live Sage credentials are provisioned.
 */
function buildMockAnswer(query) {
  const normalized = query.toLowerCase();

  if (normalized.includes('onboard') || normalized.includes('setup') || normalized.includes('access')) {
    return {
      answer: [
        '### Buki Internal Onboarding Checklist',
        '',
        '1. **Workspace & Repo Access:** Confirm GitHub org invite and clone `buki-core` + `buki-sage`.',
        '2. **Environment Secrets:** Copy `.env.example` to `.env` and request your `BUKI_API_TOKEN` from `#eng-ops`.',
        '3. **Local Services:** Start MongoDB on port `27017`, backend on `:5000`, and Vite frontend on `:5173`.',
        '',
        '> **Tip:** Use `Ctrl+K` / `Cmd+K` in Buki Assistant anytime to jump straight to the query bar.',
      ].join('\n'),
      citations: [
        { title: 'Engineering Onboarding Runbook', source: 'Buki Wiki / Eng-Ops' },
        { title: 'Local Dev Environment Guide', source: 'Buki Docs / Setup' },
      ],
    };
  }

  if (normalized.includes('incident') || normalized.includes('outage') || normalized.includes('timeout')) {
    return {
      answer: [
        '### Incident Triage & Timeout Protocol',
        '',
        '- **Immediate Check:** Verify `/api/health` returns `200 OK` and check upstream Sage API latency.',
        '- **Timeout Policy:** Buki enforces a strict **3,000 ms** timeout on Sage requests via `AbortController` so worker threads never hang.',
        '- **Escalation:** Post request ID and latency metrics in `#incidents` if error rate exceeds 2% over 5 minutes.',
      ].join('\n'),
      citations: [
        { title: 'SLA & Timeout Policy', source: 'Buki SRE Playbook' },
        { title: 'Sage Connector Architecture', source: 'Internal RFC-014' },
      ],
    };
  }

  return {
    answer: [
      `### Sage Contextual Answer`,
      '',
      `Here is the operational summary for **"${query}"**:`,
      '',
      '- **Status:** Query processed cleanly through the Buki ↔ Sage connector pipeline.',
      '- **Security:** Authenticated via Bearer token middleware with environment-managed secrets.',
      '- **Next Step:** Connect your live `SAGE_API_URL` and `SAGE_API_KEY` in `backend/.env` with `SAGE_MOCK_MODE=false` to query live workspace knowledge.',
      '',
      '```json',
      JSON.stringify({ endpoint: '/api/query', timeoutMs: 3000, mode: 'mock' }, null, 2),
      '```',
    ].join('\n'),
    citations: [
      { title: 'Buki × Sage Integration Spec', source: 'Internal Blueprint' },
    ],
  };
}

class SageConnector {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl ?? defaultConfig.sageApiUrl;
    this.apiKey = options.apiKey ?? defaultConfig.sageApiKey;
    this.timeoutMs = options.timeoutMs ?? defaultConfig.sageTimeoutMs ?? 3000;
    this.mockMode = options.mockMode ?? defaultConfig.sageMockMode;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  /**
   * Sends a query to Sage with Bearer auth and a strict request timeout (default 3000ms).
   */
  async querySage({ query, context = null, user = null }) {
    const requestId = `sage_${crypto.randomUUID()}`;

    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, 45));
      const mock = buildMockAnswer(query);
      return {
        requestId,
        answer: mock.answer,
        citations: mock.citations,
        provider: 'sage-mock',
      };
    }

    if (!this.apiUrl || !this.apiKey) {
      throw new SageServiceError(
        'Sage API credentials are missing. Configure SAGE_API_URL and SAGE_API_KEY or enable SAGE_MOCK_MODE=true.',
        { statusCode: 500, code: 'SAGE_CONFIG_ERROR' }
      );
    }

    if (typeof this.fetchImpl !== 'function') {
      throw new SageServiceError(
        'Fetch API is unavailable in this Node runtime (requires Node 18+).',
        { statusCode: 500, code: 'SAGE_RUNTIME_ERROR' }
      );
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          query,
          context,
          metadata: {
            source: 'buki-internal-assistant',
            userId: user?.id || 'anonymous',
          },
        }),
        signal: controller.signal,
      });

      if (response.status === 401 || response.status === 403) {
        throw new SageServiceError('Sage API rejected Bearer credentials.', {
          statusCode: 502,
          code: 'SAGE_AUTH_ERROR',
          details: { upstreamStatus: response.status },
        });
      }

      if (!response.ok) {
        let errorSnippet = '';
        try {
          errorSnippet = await response.text();
        } catch {
          errorSnippet = '';
        }
        throw new SageServiceError(
          `Sage API returned HTTP ${response.status}.`,
          {
            statusCode: response.status >= 500 ? 502 : response.status,
            code: 'SAGE_UPSTREAM_ERROR',
            details: errorSnippet ? errorSnippet.slice(0, 300) : null,
          }
        );
      }

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new SageServiceError('Sage API returned malformed JSON.', {
          statusCode: 502,
          code: 'SAGE_INVALID_RESPONSE',
        });
      }

      const answer =
        payload?.answer ??
        payload?.response ??
        payload?.text ??
        payload?.data?.answer ??
        payload?.message;

      if (typeof answer !== 'string' || !answer.trim()) {
        throw new SageServiceError('Sage API response did not include an answer payload.', {
          statusCode: 502,
          code: 'SAGE_INVALID_RESPONSE',
        });
      }

      return {
        requestId,
        answer: answer.trim(),
        citations: Array.isArray(payload?.citations) ? payload.citations : [],
        provider: 'sage',
      };
    } catch (err) {
      if (err instanceof SageServiceError) {
        throw err;
      }

      if (err?.name === 'AbortError') {
        throw new SageServiceError(
          `Sage API timed out after ${this.timeoutMs}ms.`,
          {
            statusCode: 504,
            code: 'SAGE_TIMEOUT',
          }
        );
      }

      throw new SageServiceError(
        `Failed to reach Sage API: ${err?.message || 'Unknown network error'}`,
        {
          statusCode: 502,
          code: 'SAGE_NETWORK_ERROR',
        }
      );
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

module.exports = {
  SageConnector,
  SageServiceError,
  defaultSageConnector: new SageConnector(),
};
