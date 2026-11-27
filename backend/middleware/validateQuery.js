const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 4000;

/**
 * Validates incoming POST /api/query payloads.
 * Ensures `query` is a non-empty string within length bounds and `context` (if given) is valid.
 */
function validateQueryRequest(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request body must be a JSON object.',
      },
    });
  }

  const { query, context } = body;

  if (typeof query !== 'string') {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Field "query" is required and must be a string.',
      },
    });
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Query cannot be empty or whitespace only.',
      },
    });
  }

  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Query must be at least ${MIN_QUERY_LENGTH} characters long.`,
      },
    });
  }

  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters.`,
      },
    });
  }

  if (context !== undefined) {
    const isString = typeof context === 'string';
    const isPlainObject = typeof context === 'object' && context !== null && !Array.isArray(context);

    if (!isString && !isPlainObject) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Optional "context" field must be a string or JSON object.',
        },
      });
    }

    const serializedLength = isString ? context.length : JSON.stringify(context).length;
    if (serializedLength > MAX_CONTEXT_LENGTH) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Optional "context" exceeds ${MAX_CONTEXT_LENGTH} characters.`,
        },
      });
    }
  }

  req.validatedQuery = {
    query: trimmedQuery,
    context: context ?? null,
  };

  return next();
}

module.exports = {
  validateQueryRequest,
  MIN_QUERY_LENGTH,
  MAX_QUERY_LENGTH,
};
