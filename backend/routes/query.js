const express = require('express');
const QueryLog = require('../models/QueryLog');
const { isDatabaseConnected } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validateQueryRequest } = require('../middleware/validateQuery');
const { defaultSageConnector, SageServiceError } = require('../services/sageConnector');

/**
 * Persists a query audit record when MongoDB is connected without failing the user request.
 */
async function recordQueryLog(entry) {
  if (!isDatabaseConnected()) {
    return;
  }
  try {
    await QueryLog.create(entry);
  } catch (err) {
    console.warn(`[query-log] Failed to persist query log: ${err.message}`);
  }
}

/**
 * Factory for the /api/query router so tests can inject auth or SageConnector instances.
 */
function createQueryRouter({
  authMiddleware = requireAuth,
  sageConnector = defaultSageConnector,
} = {}) {
  const router = express.Router();

  router.post('/', authMiddleware, validateQueryRequest, async (req, res, next) => {
    const startedAt = Date.now();
    const { query, context } = req.validatedQuery;

    try {
      const result = await sageConnector.querySage({
        query,
        context,
        user: req.user,
      });

      const latencyMs = Date.now() - startedAt;

      await recordQueryLog({
        userId: req.user.id,
        query,
        responsePreview: result.answer.slice(0, 480),
        provider: result.provider,
        latencyMs,
        status: 'success',
      });

      return res.status(200).json({
        ok: true,
        data: {
          answer: result.answer,
          citations: result.citations,
          meta: {
            requestId: result.requestId,
            latencyMs,
            provider: result.provider,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      const latencyMs = Date.now() - startedAt;
      const isTimeout = err instanceof SageServiceError && err.code === 'SAGE_TIMEOUT';

      await recordQueryLog({
        userId: req.user.id,
        query,
        provider: sageConnector.mockMode ? 'sage-mock' : 'sage',
        latencyMs,
        status: isTimeout ? 'timeout' : 'error',
        errorCode: err?.code || 'INTERNAL_ERROR',
      });

      return next(err);
    }
  });

  router.get('/history', authMiddleware, async (req, res, next) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(200).json({
          ok: true,
          data: {
            items: [],
            persistent: false,
          },
        });
      }

      const items = await QueryLog.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(15)
        .select('query responsePreview provider latencyMs status createdAt')
        .lean();

      return res.status(200).json({
        ok: true,
        data: {
          items,
          persistent: true,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = {
  createQueryRouter,
};
