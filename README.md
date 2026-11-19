# BookNest — MERN book catalog

React + Vite client, Express API, and MongoDB + Mongoose storage, aligned with the project PDF.

## First-time setup

1. Create a MongoDB Atlas account and database deployment. In Atlas, create a database user and configure network access for your computer (and later the Render API host).
2. Choose Connect > Drivers and copy the MongoDB connection string. Replace its username/password placeholders and specify a database name such as `booknest`. URL-encode special characters in the password.
3. Set `MONGO_URL` in the root `.env` to that string. A unique `JWT_SECRET` is generated locally during project setup. Keep `.env` private; never put database credentials in a `VITE_` variable.
4. Install dependencies with `npm.cmd install` and `npm.cmd install --prefix server`.
5. Run `npm.cmd run dev` from this directory. This starts the API on port 8800 and Vite on port 5173. Alternatively, run `npm.cmd run server` and `npx.cmd vite` in separate terminals.

The API waits for MongoDB before listening. Missing configuration or failed database connections stop startup with an error. There is no temporary memory database and no automatic sample-book insertion.

For a locally installed MongoDB server, set `MONGO_URL=mongodb://127.0.0.1:27017/booknest` instead.

## Source layout

- `src/App.jsx`: React Router and protected `/books` screen.
- `src/pages/Books.jsx`: book table, search, five-item pages, add/edit/delete.
- `src/pages/Auth.jsx`: registration and login.
- `src/components/catalog.jsx`: shared forms, icons, Axios Bearer-token interceptor, five-step tour.
- `server/server.js`: database connection and HTTP startup.
- `server/app.js`: Express app and router mounting.
- `server/routes/`: account and book routes.
- `server/controllers/`: request validation, authentication and database queries.
- `server/models/`: Mongoose user and book schemas.
- `server/middleware/auth.js`: token signature and expiration checks.

## API

Public routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/books`.
Token required: `GET /api/auth/me`, `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id`.

Registration hashes passwords with bcrypt. Login issues a one-hour JWT. `/api/auth/me` returns verified token claims in `user`. Any signed-in user can modify the shared catalog. Search matches title or author, ignores case, and returns `data`, `page`, `limit`, `totalItems`, `totalPages`, and `success`. Results are newest first. Sales, checkout, borrowing and returns are outside the PDF's scope.

## Verification

Run `npm.cmd run build` and `npm.cmd test --prefix server`.
The automated API checks use mocked database methods; they do not prove an Atlas connection works.
After configuring MongoDB, check `http://localhost:8800/` and `/api/health`, register, sign in, add at least six books, search by author, compare pages, edit a year, delete a book, and restart the API to confirm persistence.

## Deployment from the PDF

Render: use `server` as root directory, `npm install` as build command and `node server.js` as start command. Set `MONGO_URL` and `JWT_SECRET` in Render; allow its outbound network access in Atlas. Render supplies `PORT` (local default: 8800).

Vercel: use the project root, Vite preset, `npm run build`, and output directory `dist`. Set `VITE_API_BASE_URL` to the Render service URL ending in `/api`, then build/deploy. Keep database credentials and JWT_SECRET on the API only. Hosting has not been deployed or verified in this session.
