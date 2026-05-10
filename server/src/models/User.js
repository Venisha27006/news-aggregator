import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    preferences: {
      categories: {
        type: [String],
        default: [],
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
    /** Bonus: bookmarked article ids */
    bookmarks: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
      default: [],
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const User = mongoose.model('User', userSchema);
