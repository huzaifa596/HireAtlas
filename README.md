# HireAtlas

HireAtlas is a full-stack job platform for creating listings, applying with a CV, managing a candidate profile, and exploring application analytics.

## Run locally

1. Create a PostgreSQL database named `hireatlas`.
2. Run the single database bootstrap file:

   ```powershell
   psql -U postgres -d hireatlas -f database/hireatlas_postgres.sql
   ```

3. Copy `.env-template` to `backend/.env` and fill in the secrets. `DATABASE_URL` is the recommended connection setting.
4. Install and start the backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

5. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

The frontend uses `http://localhost:5000/api` by default. Set `VITE_API_URL` in `frontend/.env.local` for a deployed API. Set `CLIENT_ORIGIN` in the backend environment if the frontend is served from a different origin.

## Database

`database/hireatlas_postgres.sql` is now the canonical schema. It contains every table, relationship, validation constraint, performance index, and application-status trigger required by the backend. The older `.sql` files are retained only as SQL Server reference material and should not be run for a PostgreSQL install.

## Improvement tracker

| Date | Area | Completed work |
| --- | --- | --- |
| 2026-09-16 | Repository sync | Replaced the stale local recovery checkout with current `origin/main`; preserved the old snapshot in `backup/local-recovery-2026-09-16`. |
| 2026-09-16 | PostgreSQL migration | Removed the SQL Server driver from the backend configuration, added `pg`, PostgreSQL connection settings, parameterized filters, and a single PostgreSQL bootstrap script. Existing API routes remain compatible. |
| 2026-09-16 | Reliability & security | Added configurable CORS, request body limits, static upload paths independent of working directory, centralized upload/JSON errors, backend start/test scripts, API timeouts, and safer environment defaults. |
| 2026-09-16 | UI & mobile | Fixed the mobile menu’s incorrect tabs and placeholder identity, made it use normal dashboard state transitions, added keyboard focus visibility, responsive image protection, reduced-motion support, and deployment-configurable API addressing. |
| 2026-09-16 | Verification | Frontend production build succeeds; backend source syntax checks pass. |

## Notes for deployment

- Never commit `.env`, user-uploaded CVs, or SMTP/API keys.
- Use a long random `JWT_SECRET` and a managed PostgreSQL `DATABASE_URL` in production.
- `DB_SSL=true` enables TLS for hosted PostgreSQL providers.
