const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { createApp } = require('../app');
const { createAuthMiddleware } = require('../middleware/auth');
const { SageConnector } = require('../services/sageConnector');

const TEST_BUKI_TOKEN = 'test-buki-internal-token';
const TEST_SAGE_KEY = 'test-sage-secret-key';

async function startTestServer(connectorOptions = {}) {
  const sageConnector = new SageConnector({
    apiUrl: 'https://sage.test.local/v1/query',
    apiKey: TEST_SAGE_KEY,
    timeoutMs: 3000,
    mockMode: false,
    ...connectorOptions,
  });

  const app = createApp({
    authMiddleware: createAuthMiddleware(() => TEST_BUKI_TOKEN),
    sageConnector,
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

test('Pre-Code Test 1: Valid Query Check returns contextual answer and forwards Sage Bearer token', async () => {
  let capturedAuthHeader = null;
  let capturedBody = null;

  const mockFetch = async (_url, init) => {
    capturedAuthHeader = init.headers.Authorization;
    capturedBody = JSON.parse(init.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        answer: '### Deploy Runbook\nUse `npm run deploy` after passing checks.',
        citations: [{ title: 'Deploy Docs', source: 'Buki Wiki' }],
      }),
    };
  };

  const srv = await startTestServer({ fetchImpl: mockFetch });

  try {
    const res = await fetch(`${srv.baseUrl}/api/query`, {
      method: 'POST',
      header
      s: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_BUKI_TOKEN}`,
      },
      body: JSON.stringify({ query: 'How do we deploy Buki services?' }),
    });

    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.data.answer, /Deploy Runbook/);
    assert.equal(body.data.citations.length, 1);
    assert.equal(body.data.meta.provider, 'sage');
    assert.equal(typeof body.data.meta.latencyMs, 'number');
    assert.equal(capturedAuthHeader, `Bearer ${TEST_SAGE_KEY}`);
    assert.equal(capturedBody.query, 'How do we deploy Buki services?');
  } finally {
    await srv.close();
  }
});

test('Pre-Code Test 2: Malformed/Empty Query Validation rejects invalid payloads with 400', async () => {
  const srv = await startTestServer({ mockMode: true });

  try {
    const invalidPayloads = [
      { query: '' },
      { query: '   ' },
      { query: 'a' },
      { query: 12345 },
      {},
    ];

    for (const payload of invalidPayloads) {
      const res = await fetch(`${srv.baseUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TEST_BUKI_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.ok, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    }

    // Malformed raw JSON syntax
    const rawRes = await fetch(`${srv.baseUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_BUKI_TOKEN}`,
      },
      body: '{"query": "broken json"',
    });
    const rawBody = await rawRes.json();
    assert.equal(rawRes.status, 400);
    assert.equal(rawBody.error.code, 'VALIDATION_ERROR');
  } finally {
    await srv.close();
  }
});

test('Pre-Code Test 3: Authentication Check blocks unauthenticated or unauthorized requests with 401', async () => {
  const srv = await startTestServer({ mockMode: true });

  try {
    const headersList = [
      { 'Content-Type': 'application/json' },
      { 'Content-Type': 'application/json', Authorization: 'Basic abc123' },
      { 'Content-Type': 'application/json', Authorization: 'Bearer wrong-token' },
    ];

    for (const headers of headersList) {
      const res = await fetch(`${srv.baseUrl}/api/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: 'What is our SLA?' }),
      });
      const body = await res.json();
      assert.equal(res.status, 401);
      assert.equal(body.ok, false);
      assert.equal(body.error.code, 'UNAUTHORIZED');
    }
  } finally {
    await srv.close();
  }
});

test('Pre-Code Test 4a: Timeout handling aborts stalled Sage requests cleanly with 504', async () => {
  const hangingFetch = (_url, init) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        const err = new Error('The operation was aborted.');
        err.name = 'AbortError';
        reject(err);
      });
    });

  const srv = await startTestServer({
    timeoutMs: 80,
    fetchImpl: hangingFetch,
  });

  try {
    const res = await fetch(`${srv.baseUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_BUKI_TOKEN}`,
      },
      body: JSON.stringify({ query: 'Trigger timeout check' }),
    });
    const body = await res.json();
    assert.equal(res.status, 504);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'SAGE_TIMEOUT');
  } finally {
    await srv.close();
  }
});

test('Pre-Code Test 4b: Latency & Concurrency Check handles 10 simultaneous queries cleanly', async () => {
  const fastFetch = async (_url, init) => {
    const parsed = JSON.parse(init.body);
    await new Promise((r) => setTimeout(r, 25));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        answer: `Answer for: ${parsed.query}`,
      }),
    };
  };

  const srv = await startTestServer({ fetchImpl: fastFetch });

  try {
    const startedAt = Date.now();
    const requests = Array.from({ length: 10 }, (_, idx) =>
      fetch(`${srv.baseUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TEST_BUKI_TOKEN}`,
        },
        body: JSON.stringify({ query: `Concurrent query #${idx + 1}` }),
      }).then(async (res) => ({ status: res.status, body: await res.json() }))
    );

    const results = await Promise.all(requests);
    const totalElapsed = Date.now() - startedAt;

    assert.ok(totalElapsed < 2000, `Expected concurrent batch < 2000ms, got ${totalElapsed}ms`);
    results.forEach((result, idx) => {
      assert.equal(result.status, 200);
      assert.equal(result.body.ok, true);
      assert.equal(result.body.data.answer, `Answer for: Concurrent query #${idx + 1}`);
    });
  } finally {
    await srv.close();
  }
});
