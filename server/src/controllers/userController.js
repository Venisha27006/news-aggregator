import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Article } from '../models/Article.js';

/**
 * Current user profile (no password).
 */
export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      bookmarks: user.bookmarks || [],
      createdAt: user.createdAt,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Update category + keyword preferences.
 */
export async function updatePreferences(req, res, next) {
  try {
    const { categories, keywords } = req.body;
    const update = {};
    if (Array.isArray(categories)) {
      update['preferences.categories'] = categories.map((c) => String(c).trim()).filter(Boolean);
    }
    if (Array.isArray(keywords)) {
      update['preferences.keywords'] = keywords.map((k) => String(k).trim()).filter(Boolean);
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Bonus: toggle bookmark for an article.
 */
export async function toggleBookmark(req, res, next) {
  try {
    const { articleId } = req.params;
    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(400).json({ message: 'Invalid article id' });
    }
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const user = await User.findById(req.userId);
    const idx = user.bookmarks.map(String).indexOf(String(articleId));
    if (idx >= 0) {
      user.bookmarks.splice(idx, 1);
    } else {
      user.bookmarks.push(article._id);
    }
    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (e) {
    next(e);
  }
}
