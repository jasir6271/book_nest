# Meridian Books

Full MERN-style book catalog implementation based on the uploaded project guide.

## Run locally

1. Copy `.env.example` to `.env` and set `JWT_SECRET`. Add `MONGO_URL` for MongoDB; if it is omitted, the API uses an in-memory development store.
2. Install dependencies:

```powershell
npm.cmd install
npm.cmd install --prefix server
```

3. Start the API and client in separate terminals:

```powershell
npm.cmd run server
npm.cmd run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:8800`.

## Deployment

The included `render.yaml` deploys the API on Render. Set `MONGO_URL` to the Atlas connection string and set a strong `JWT_SECRET` in Render. Deploy the client to Vercel using the included `vercel.json`, and set `VITE_API_BASE_URL` to the deployed API URL ending in `/api`.

## Implemented API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/books?page=1&limit=5&search=...`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `GET /api/health`

Write routes require a valid one-hour Bearer JWT. The client uses an Axios interceptor to attach it automatically, React Router protects `/books`, and the five-step tour persists completion in the browser.
