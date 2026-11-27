import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  CornerDownLeft,
  Loader2,
  LogOut,
  RotateCcw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { submitSageQuery } from '../services/api';

const QUICK_PROMPTS = [
  'How do I complete Buki engineering onboarding and local setup?',
  'What is our incident triage and 3-second Sage timeout protocol?',
  'Summarize Buki internal API authentication requirements.',
];

const MAX_QUERY_LENGTH = 2000;

function ResponseSkeleton() {
  return (
    <div className="answer-card skeleton-card" aria-busy="true" aria-label="Loading Sage response">
      <div className="skeleton-header">
        <Loader2 size={15} className="spin" />
        <span>Querying Sage...</span>
      </div>
      <div className="skeleton-line wide" />
      <div className="skeleton-line medium" />
      <div className="skeleton-line wide" />
      <div className="skeleton-line short" />
    </div>
  );
}

export default function QueryAssistant({ token, onUnauthorized, onSignOut }) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const inputRef = useRef(null);
  const feedEndRef = useRef(null);

  useEffect(() => {
    function handleGlobalShortcut(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, loading]);

  async function runQuery(rawText) {
    const trimmed = rawText.trim();

    if (!trimmed) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Please enter a question before submitting.',
      });
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length < 2) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Query must be at least 2 characters long.',
      });
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await submitSageQuery({ query: trimmed, token });
      setEntries((prev) => [
        ...prev,
        {
          id: result.data.meta.requestId,
          query: trimmed,
          answer: result.data.answer,
          citations: result.data.citations || [],
          meta: result.data.meta,
        },
      ]);
      setQuery('');
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized('Your Buki session token was rejected or expired. Please re-authenticate.');
        return;
      }
      setError({
        code: err.code || 'ERROR',
        message: err.message || 'Failed to fetch answer from Sage.',
        retryableQuery: trimmed,
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!loading) {
      runQuery(query);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        runQuery(query);
      }
    } else if (e.key === 'Escape') {
      setError(null);
      setQuery('');
    }
  }

  async function handleCopy(id, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  return (
    <div className="assistant-layout">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-dot" />
          <span className="brand-title">Buki × Sage</span>
          <span className="status-pill">Authenticated</span>
        </div>

        <div className="topbar-right">
          <span className="shortcut-hint">
            <kbd>Ctrl</kbd>+<kbd>K</kbd> to focus
          </span>
          <button type="button" className="btn-ghost" onClick={onSignOut}>
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>

      <main className="feed-container">
        {entries.length === 0 && !loading && (
          <section className="empty-state">
            <div className="empty-icon">
              <Sparkles size={20} />
            </div>
            <h2>Ask Sage anything about Buki workflows</h2>
            <p>
              Instant contextual answers with 3-second SLA timeout protection and token-authenticated
              access.
            </p>
            <div className="prompt-chips">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="prompt-chip"
                  onClick={() => runQuery(prompt)}
                >
                  <Terminal size={13} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="entries-list">
          {entries.map((entry) => (
            <article key={entry.id} className="qa-pair">
              <div className="question-bubble">{entry.query}</div>

              <div className="answer-card">
                <div className="answer-meta-bar">
                  <span className="provider-tag">{entry.meta.provider}</span>
                  <span className="latency-tag">
                    <Clock size={12} />
                    {entry.meta.latencyMs} ms
                  </span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopy(entry.id, entry.answer)}
                    title="Copy markdown answer"
                  >
                    {copiedId === entry.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === entry.id ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.answer}</ReactMarkdown>
                </div>

                {entry.citations.length > 0 && (
                  <div className="citations-row">
                    <span className="citations-label">Sources:</span>
                    {entry.citations.map((cite, idx) => (
                      <span key={`${entry.id}-cite-${idx}`} className="citation-pill">
                        {cite.title || cite.source || 'Internal Doc'}
                        {cite.source && cite.title ? ` · ${cite.source}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}

          {loading && <ResponseSkeleton />}
          <div ref={feedEndRef} />
        </div>
      </main>

      <footer className="sticky-composer">
        <div className="composer-inner">
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={16} />
              <div className="error-text">
                <strong>{error.code}:</strong> {error.message}
              </div>
              {error.retryableQuery && (
                <button
                  type="button"
                  className="retry-btn"
                  onClick={() => runQuery(error.retryableQuery)}
                  disabled={loading}
                >
                  <RotateCcw size={13} />
                  Retry
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="query-form">
            <textarea
              ref={inputRef}
              rows={2}
              value={query}
              maxLength={MAX_QUERY_LENGTH}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Sage about runbooks, APIs, onboarding, or operational workflows..."
              disabled={loading}
              aria-label="Ask Sage"
            />
            <div className="composer-actions">
              <span className="char-counter">
                {query.length}/{MAX_QUERY_LENGTH}
              </span>
              <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    Asking...
                  </>
                ) : (
                  <>
                    Ask Sage
                    <CornerDownLeft size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
