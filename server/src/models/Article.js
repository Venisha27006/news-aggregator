import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    imageUrl: { type: String, default: '' },
    source: { type: String, default: '' },
    category: { type: String, default: 'general' },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Secondary index for sorting personalized feeds by recency
articleSchema.index({ publishedAt: -1 });

export const Article = mongoose.model('Article', articleSchema);
