# Architecture

UnBg is a full-stack image background removal service. Users upload images, backgrounds are removed via AI, and results are stored for sharing.

## System Overview

```mermaid
flowchart LR
    subgraph Client
        A[React App]
    end

    subgraph Server
        B[Bun Server]
    end

    subgraph External
        C[(Supabase)]
        D[PhotoRoom API]
    end

    A -->|POST /api/upload| B
    B -->|Store images| C
    B -->|Remove background| D
    D -->|Processed image| B
    B -->|URLs| A
```

## Request Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant PhotoRoom
    participant Supabase

    User->>Frontend: Select image
    Frontend->>Backend: POST /api/upload (FormData)

    par Parallel processing
        Backend->>Supabase: Upload original
        Backend->>PhotoRoom: Remove background
    end

    PhotoRoom-->>Backend: Processed image
    Backend->>Supabase: Upload processed
    Backend->>Supabase: Save metadata
    Backend-->>Frontend: URLs + shortId
    Frontend-->>User: Display result
```

## Project Structure

```
UnBg/
├── src/                    # React frontend
│   ├── App.tsx             # Main component, state management
│   └── components/
│       ├── DropZone.tsx    # File upload (drag/drop/paste)
│       ├── ImagePreview.tsx
│       └── ResultDisplay.tsx
│
├── server/src/             # Bun backend
│   ├── index.ts            # HTTP server, routing
│   ├── lib/
│   │   ├── config.ts       # Environment config
│   │   ├── photoroom.ts    # PhotoRoom API client
│   │   ├── supabase.ts     # Supabase client
│   │   ├── security.ts     # Rate limiting, validation
│   │   └── imageUtils.ts   # Image manipulation (sharp)
│   └── routes/
│       ├── upload.ts       # POST /api/upload
│       ├── images.ts       # GET/DELETE /api/images/:id
│       └── redirect.ts     # GET /i/:shortId
```

## API Endpoints

| Method | Path              | Description                          |
| ------ | ----------------- | ------------------------------------ |
| POST   | `/api/upload`     | Upload image, returns processed URLs |
| GET    | `/api/images/:id` | Get image metadata                   |
| DELETE | `/api/images/:id` | Delete image and files               |
| GET    | `/i/:shortId`     | Redirect to processed image          |
| GET    | `/health`         | Health check                         |

## Data Model

```mermaid
erDiagram
    images {
        text id PK
        text short_id UK
        text original_url
        text processed_url
        boolean is_mirrored
        timestamp created_at
    }
```

**Storage paths:**

- `originals/{id}.png` - uploaded image
- `processed/{id}.png` - background removed

## Security

- **Rate limiting**: 30 requests/minute per IP
- **File validation**: Magic number checks (not just MIME type)
- **Filename sanitization**: Strips unsafe characters
- **CORS**: Configurable allowed origins
- **Headers**: X-Frame-Options, X-Content-Type-Options, etc.

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend  | Bun, TypeScript                             |
| Database | Supabase (PostgreSQL)                       |
| Storage  | Supabase Storage                            |
| AI       | PhotoRoom API                               |
