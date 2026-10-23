# Synapse deployment with Supabase Auth + Render

## Architecture
One Render Node web service serves both the static dashboard and Express API. Supabase hosts PostgreSQL, pgvector, and Google Auth. The Chrome extension must be rebuilt with the Render service URL and obtain a Supabase session from the dashboard.

## Setup
1. Create or select a Supabase project. In the SQL editor, apply `db/schema.sql` (enable pgvector first if unavailable).
2. In Supabase Authentication > Providers, enable Google and provide OAuth client ID/secret. In Google Cloud, use the Supabase callback URL from the provider page as an authorized redirect URI.
3. Under Authentication > URL configuration, set Site URL to the deployed `https://YOUR-SERVICE.onrender.com` address, and add `https://YOUR-SERVICE.onrender.com/app` to redirect URLs.
4. Deploy Render web service from this repository, using **Root Directory = backend**, **Runtime = Docker**. This backend Dockerfile runs the Express server and serves the HTML dashboard.
5. Set these Render environment variables:
   - `DATABASE_URL`: Supabase *session pooler* PostgreSQL URI, ideally with TLS (`sslmode=require`).
   - `SUPABASE_URL`: Project API URL.
   - `SUPABASE_PUBLISHABLE_KEY`: Public publishable key (not service role or secret key).
   - `NODE_ENV=production`.
6. Enable Google OAuth in Supabase and validate login, logout, invalid token 401s, and identity isolation before serving real users.

## Caveats
- Old self-issued JWT sessions will not work; users must log in again.
- Auth JWT verification uses Supabase's asymmetric JWK keys. If a project uses legacy HS256 tokens, migrate its JWT signing keys to asymmetric signing before using this middleware.
- User data in the original PostgreSQL DB is not automatically migrated. Plan an ID-mapping migration before switching a populated application.
- Dashboard and Chrome extension have a complex older scopes model. Never permit arbitrary user-provided scope identifiers to access another user.
- Render must be sized for the Transformers/ONNX embedding model. Local Ollama at localhost cannot be reached from cloud hosting; supply a reachable external LLM API for generative features.
- The repository contains a bundled extension ZIP that still contains older code; rebuild it before publishing extension downloads.
- The original backend has tests and files that may assume old JWTs; update integration tests before production.
