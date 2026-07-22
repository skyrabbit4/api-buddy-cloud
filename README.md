# MockAPI

A mock API service that lets developers create custom endpoints for testing and prototyping.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Angular)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Landing │  │  Login   │  │Dashboard │  │ Create Endpoint  │ │
│  │   Page   │  │   Page   │  │   Page   │  │     Dialog       │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                      Services Layer                        │  │
│  │  AuthService │ MockStoreService │ UsageService │ Supabase │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Netlify Functions (Edge)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │   /m/*     │  │  checkout  │  │  webhook   │  │  verify   │  │
│  │ mock serve │  │  (Dodo)    │  │  (Dodo)    │  │   sub     │  │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Auth (OAuth)   │  │              Database                 │ │
│  │  Google, GitHub  │  │  endpoints │ profiles │ usage │ logs │ │
│  └──────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 20, TypeScript, SCSS |
| Backend | Netlify Functions (serverless) |
| Database | Supabase (PostgreSQL + Auth) |
| Payments | Dodo Payments |
| Hosting | Netlify |

## Project Structure

```
src/
├── app/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route pages (dashboard, login, etc.)
│   ├── services/         # Business logic & API calls
│   ├── guards/           # Route guards (auth)
│   └── shared/           # Shared utilities
├── environments/         # Environment configs
└── assets/               # Static assets

netlify/
└── functions/            # Serverless functions
    ├── mock.ts           # Serves mock endpoints (/m/*)
    ├── create-checkout.ts
    ├── dodo-webhook.ts
    └── verify-subscription.ts

supabase/
└── migrations/           # Database migrations
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `endpoints` | User-created mock endpoints |
| `profiles` | User plans & limits |
| `usage` | Monthly request counts |
| `request_logs` | Request analytics |

## Development

```bash
npm install
ng serve
```

Open http://localhost:4200

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments API key |
| `DODO_WEBHOOK_SECRET` | Dodo webhook verification |
| `DODO_PRO_PRODUCT_ID` | Pro plan product ID |

## Deployment

Push to `main` branch triggers auto-deploy on Netlify.
