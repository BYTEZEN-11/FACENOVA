const mongoose = require('mongoose');

const sourceCacheSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    credibilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    domainAge: {
      type: Number, 
      default: 0,
    },
    sslValid: {
      type: Boolean,
      default: false,
    },
    reputation: {
      type: String,
      enum: ['trusted', 'reliable', 'questionable', 'unreliable', 'satire', 'unknown'],
      default: 'unknown',
    },
    category: String,
    country: String,
    lastChecked: {
      type: Date,
      default: Date.now,
    },
    checkCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

sourceCacheSchema.index({ lastChecked: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const SourceCache = mongoose.model('SourceCache', sourceCacheSchema);

module.exports = SourceCache;
