# UnBG

Remove image backgrounds instantly. Upload an image, get a transparent PNG.

## Quick Start

**Prerequisites:** [Bun](https://bun.sh), [Supabase](https://supabase.com) project, [PhotoRoom](https://www.photoroom.com/api) API key

```bash
# Install dependencies
npm install
cd server && bun install

# Configure environment
cp .env.example .env
cp server/.env.example server/.env
# Edit both .env files with your credentials

# Run
bun server/src/index.ts  # Backend on :3000
npm run dev              # Frontend on :5173
```

## Environment Variables

**Frontend (.env)**

```
VITE_API_URL=http://localhost:3000
```

**Backend (server/.env)**

```
PORT=3000
BASE_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:5173
SUPABASE_URL=your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
PHOTOROOM_API_KEY=your-api-key
```

## Supabase Setup

1. Create a storage bucket named `images` (public)
2. Create the `images` table:

```sql
create table images (
  id text primary key,
  short_id text unique not null,
  original_url text not null,
  processed_url text not null,
  is_mirrored boolean default false,
  created_at timestamptz default now()
);
```

## Deployment

**Frontend** (Vercel, Netlify, Cloudflare Pages)

- Build: `npm run build`
- Output: `dist/`
- Set `VITE_API_URL` to your backend URL

**Backend** (Railway, Render, Fly.io)

- Runtime: Bun
- Entry: `server/src/index.ts`
- Set all server environment variables

## Architecture

See [docs/architecture.md](docs/architecture.md) for system design and API details.

## License

MIT
