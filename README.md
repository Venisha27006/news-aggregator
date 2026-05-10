# Personalized News Aggregator

Full-stack app: **React** (Vite) + **Node.js / Express** + **MongoDB (Mongoose)** + **JWT** + **bcrypt**. News is pulled from [NewsAPI](https://newsapi.org/) on a schedule, stored in MongoDB, and each user sees a feed filtered by their categories and keywords.

## Features

- **Auth**: Sign up / login, JWT in `localStorage`, protected API routes
- **Multi-user**: Unique emails, hashed passwords, per-user preferences
- **Preferences**: Categories (checkboxes) + custom keywords; saved in MongoDB
- **News sync**: Cron job every **10 minutes**; dedupe by **unique article URL**
- **Personalization**: Articles matching selected **categories** OR **keyword** hits in title/description; sorted **newest first**
- **Infinite scroll**: Intersection Observer + `skip` / `limit` pagination
- **Bonus**: Bookmarks, dark mode toggle

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- A [NewsAPI](https://newsapi.org/register) API key (free tier is enough for development)

## Backend setup

```bash
cd server
copy .env.example .env
```

Edit `server/.env`:

- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/news-aggregator`
- `JWT_SECRET` — long random string
- `NEWS_API_KEY` — from NewsAPI
- `CLIENT_URL` — `http://localhost:5173` for local dev

Install and run:

```bash
cd server
npm install
npm run dev
```

API base: `http://localhost:5000/api`

### API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/user/profile` | Yes | Profile |
| PUT | `/api/user/preferences` | Yes | Update categories / keywords |
| POST | `/api/user/bookmarks/:articleId` | Yes | Toggle bookmark (bonus) |
| GET | `/api/articles?skip=&limit=` | Yes | Personalized feed |

## Frontend setup

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:5000`.

For a production build, set `VITE_API_URL` to your API URL (see `client/.env.example`).

## Run both (optional)

From the project root, after installing dependencies in `server` and `client`:

```bash
npx concurrently "npm run dev --prefix server" "npm run dev --prefix client"
```

## Project layout

```
server/src
  config/       # DB connection
  controllers/  # Auth, user, articles
  middleware/   # JWT, validation, errors
  models/       # User, Article
  routes/       # Express routers
  services/     # News fetch + cron

client/src
  components/   # Navbar, NewsCard
  context/      # Auth, theme
  pages/        # Login, Signup, Home, Preferences
```

## Security notes

- Passwords are hashed with **bcrypt** (cost factor 12); no default passwords
- Private routes require `Authorization: Bearer <token>`
- Use a strong `JWT_SECRET` in production

## License

MIT
