const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CLIENT_TIMEOUT_MS = 4500;

export class ApiClientError extends Error {
  constructor(message, { status = 500, code = 'CLIENT_ERROR' } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

async function requestJson(path, { method = 'GET', token = '', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const headers = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ApiClientError(
        data?.error?.message || `Request failed with status ${res.status}.`,
        {
          status: res.status,
          code: data?.error?.code || 'HTTP_ERROR',
        }
      );
    }

    return data;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err?.name === 'AbortError') {
      throw new ApiClientError('Request timed out waiting for Buki backend.', {
        status: 504,
        code: 'CLIENT_TIMEOUT',
      });
    }
    throw new ApiClientError('Unable to reach Buki backend server. Verify it is running on port 5000.', {
      status: 0,
      code: 'NETWORK_ERROR',
    });
  } finally {
    clearTimeout(timer);
  }
}

export function fetchHealth() {
  return requestJson('/api/health');
}

export function verifySessionToken(token) {
  return requestJson('/api/query/history', { method: 'GET', token });
}

export function submitSageQuery({ query, token }) {
  return requestJson('/api/query', {
    method: 'POST',
    token,
    body: { query },
  });
}
