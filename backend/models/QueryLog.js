const mongoose = require('mongoose');

const queryLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    responsePreview: {
      type: String,
      default: '',
      maxlength: 500,
    },
    provider: {
      type: String,
      enum: ['sage', 'sage-mock'],
      default: 'sage',
    },
    latencyMs: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['success', 'error', 'timeout'],
      required: true,
    },
    errorCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QueryLog', queryLogSchema);
