const mongoose = require('mongoose');

const indicatorSchema = new mongoose.Schema(
  {
    clickbait: { type: Number, min: 0, max: 100, default: 0 },
    emotionalManipulation: { type: Number, min: 0, max: 100, default: 0 },
    sensationalism: { type: Number, min: 0, max: 100, default: 0 },
    misleadingPatterns: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    verified: { type: Boolean, default: false },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    sources: [String],
    verificationNote: String,
  },
  { _id: false }
);

const sourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: String,
    credibilityScore: { type: Number, min: 0, max: 100 },
    agreement: {
      type: String,
      enum: ['supports', 'disputes', 'neutral', 'unverified', 'source_evaluated'],
      default: 'unverified',
    },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    classification: {
      type: String,
      enum: ['real', 'fake', 'suspicious'],
      required: true,
    },
    trustScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    reasoning: [String],
    indicators: { type: indicatorSchema, default: () => ({}) },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    inputType: {
      type: String,
      enum: ['text', 'url', 'image'],
      required: true,
    },
    inputContent: {
      type: String,
      required: true,
      maxlength: [50000, 'Content too large'],
    },
    inputMetadata: {
      url: String,
      domain: String,
      imageHash: String,
      contentLength: Number,
    },
    analysis: { type: analysisSchema, required: true },
    extractedClaims: [claimSchema],
    sources: [sourceSchema],
    metadata: {
      ipAddress: String,
      userAgent: String,
      processingTime: Number,
      modelVersions: mongoose.Schema.Types.Mixed,
    },
    isPublic: { type: Boolean, default: false },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ inputType: 1, 'analysis.classification': 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.index({ inputContent: 'text', tags: 'text' });

reportSchema.virtual('verdictLabel').get(function () {
  const score = this.analysis?.trustScore ?? 0;
  if (score >= 70) return 'Likely True';
  if (score >= 40) return 'Suspicious';
  return 'Likely False';
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
