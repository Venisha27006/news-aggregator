import { Article } from '../models/Article.js';
import { User } from '../models/User.js';

/**
 * Builds MongoDB filter:
 * - If only categories selected → match those categories
 * - If only keywords selected  → match those keywords in title/description
 * - If both are selected       → article must match category AND at least one keyword
 * - If nothing selected        → return all articles (no filter)
 */
function buildPersonalizedFilter(preferences) {
  const categories = (preferences?.categories || []).map((c) => c.toLowerCase());
  const keywords = (preferences?.keywords || []).map((k) => k.toLowerCase()).filter(Boolean);

  const and = [];

  if (categories.length) {
    and.push({ category: { $in: categories } });
  }

  if (keywords.length) {
    const keywordClauses = [];
    for (const k of keywords) {
      const r = new RegExp(escapeRegex(k), 'i');
      keywordClauses.push({ title: { $regex: r } }, { description: { $regex: r } });
    }
    and.push({ $or: keywordClauses });
  }

  if (!and.length) {
    // No preferences → no filter → caller will sort by date
    return {};
  }

  if (and.length === 1) {
    return and[0];
  }

  return { $and: and };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Personalized feed with skip/limit for infinite scroll.
 * Articles must match the user's selected categories/keywords (when set).
 */
export async function getPersonalizedFeed(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const filter = buildPersonalizedFilter(user.preferences);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const bookmarkSet = new Set((user.bookmarks || []).map(String));

    const items = articles.map((a) => ({
      ...a,
      id: a._id,
      bookmarked: bookmarkSet.has(String(a._id)),
    }));

    res.json({
      items,
      total,
      skip,
      limit,
      hasMore: skip + items.length < total,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * List all bookmarked articles for the current user, newest first.
 */
export async function getBookmarkedArticles(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ids = (user.bookmarks || []).map((id) => id.toString());
    if (!ids.length) {
      return res.json({ items: [], total: 0 });
    }

    const articles = await Article.find({ _id: { $in: ids } })
      .sort({ publishedAt: -1 })
      .lean();

    const items = articles.map((a) => ({
      ...a,
      id: a._id,
      bookmarked: true,
    }));

    res.json({
      items,
      total: items.length,
    });
  } catch (e) {
    next(e);
  }
}
