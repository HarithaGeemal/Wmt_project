import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    // Feedback categories/tags
    categories: { type: [String], enum: ['quality', 'delivery', 'service', 'packaging', 'other'], default: [] },
    // Admin moderation status
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNotes: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    // Helpful votes tracking
    votes: {
      helpful: { type: Number, default: 0 },
      unhelpful: { type: Number, default: 0 },
      helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      unhelpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    // Admin responses
    adminResponses: [
      {
        respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// One feedback per user per product
feedbackSchema.index({ userId: 1, productId: 1 }, { unique: true });

feedbackSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

export default mongoose.model('Feedback', feedbackSchema, 'Feedback');
