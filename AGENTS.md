# Afilo - Codebase Guidelines

This document provides guidelines for AI agents working with the Afilo codebase.

## Project Overview

Afilo is a high-performance web system for local service contractors (HVAC, plumbers, electricians, dental clinics). It provides:
- 5-minute micro-demo engine
- $200/mo managed retainer
- Instant SMS lead routing
- Client portal embedded in Whop ecosystem
- Interactive assessment wizard with churn calculator and blueprint generation
- Monetization funnel (Skip-the-Line fast-track vs. free queue)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Bun | 1.3.14 |
| Framework | Next.js | 16.3.1 (App Router) |
| Language | TypeScript | 5.x (strict) |
| Database | Neon PostgreSQL | Serverless |
| ORM | Prisma | 7.x |
| Styling | Tailwind CSS | 4.x |
| Auth/Billing | Whop SDK | 0.0.42 |
| Telephony | Twilio | 6.x |

## Directory Structure

```
afilo-webmanagement-whop/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── leads/route.ts            # Lead ingestion + SMS dispatch
│   │   ├── whop-webhook/route.ts     # Whop membership sync
│   │   └── generate-blueprint/route.ts # Churn calculator + blueprint gen
│   ├── dashboard/page.tsx            # Client portal
│   ├── experiences/[experienceId]/page.tsx # Whop wizard page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Tailwind v4 theme
├── components/
│   ├── ui/                           # Primitive UI components
│   ├── whop-wizard/                  # Interactive wizard engine
│   │   ├── whop-wizard-engine.tsx    # 9-step wizard client component
│   │   └── index.ts                  # Barrel export
│   ├── onboarding-intake-form.tsx
│   └── lead-activity-table.tsx
├── lib/
│   ├── prisma.ts                     # Prisma Client singleton
│   ├── twilio.ts                     # Twilio client
│   └── whop.ts                       # Whop SDK client
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Database seed script
│   └── config.ts                     # Prisma configuration
├── types/
│   └── preview.ts                    # TypeScript interfaces
├── docs/                             # Documentation
├── proxy.ts                          # Next.js middleware (NOT middleware.ts)
└── prisma.config.ts                  # Prisma CLI configuration
```

## Code Standards

### TypeScript Rules

1. **Strict Mode** - Always use strict TypeScript
2. **No `any`** - Never use `any` type
3. **Explicit Returns** - Always specify return types
4. **Prisma Types** - Use generated types from Prisma

### Next.js 16 Conventions

1. **Middleware** - Use `proxy.ts` (NOT `middleware.ts`)
2. **Exports** - Export named `proxy` function
3. **Params** - Use `Promise<>` type for params
   ```typescript
   export default async function Page({
     params,
   }: {
     params: Promise<{ experienceId: string }>;
   }) {
     const { experienceId } = await params;
   }
   ```

### API Routes

1. **Response Format** - Always return structured JSON
   ```typescript
   { success: boolean; data?: T; error?: string }
   ```

2. **Error Handling** - Use try/catch with descriptive errors
3. **Input Validation** - Validate all request body fields
4. **Type Safety** - Use TypeScript interfaces for payloads

### Wizard Blueprint Generation

1. **Churn Formula** - Deterministic calculation:
   ```typescript
   const annualLoss = Math.round(memberCount * pricePerMonth * 0.12 * 12);
   const monthlyLoss = Math.round(annualLoss / 12);
   ```
2. **Blueprint Matrix** - `NICHE_BLUEPRINT_TEMPLATES` maps 6 niches × 3 options
3. **Goal Modifiers** - `GOAL_MODIFIERS` transforms feature lists per `PrimaryGoal`
4. **App Idea Injection** - `funnelState.appIdea` is appended to `whyItFits` when provided

### Prisma 7

1. **Driver Adapter** - Use `PrismaPg` adapter
   ```typescript
   import { PrismaPg } from "@prisma/adapter-pg";
   const adapter = new PrismaPg({ connectionString });
   const prisma = new PrismaClient({ adapter });
   ```

2. **Config File** - Use `prisma.config.ts` (NOT `url` in schema)
3. **Schema** - `datasource` block requires `provider` only

### Styling

1. **Tailwind v4** - Use `@theme` block in `globals.css`
2. **Design Tokens** - Use CSS custom properties
3. **Components** - Use `clsx` and `tailwind-merge`
4. **Client Components** - Use `cn()` utility from `clsx` + `tailwind-merge`

## File Naming Conventions

- **Components** - PascalCase: `Button.tsx`, `Card.tsx`
- **Pages** - lowercase: `page.tsx`, `layout.tsx`
- **API Routes** - lowercase: `route.ts`
- **Utilities** - camelCase: `prisma.ts`, `twilio.ts`
- **Types** - camelCase: `preview.ts`

## Environment Variables

Required variables (see `.env.example`):

```bash
DATABASE_URL          # Neon PostgreSQL connection
NEON_API_KEY          # Neon API key
NEON_PROJECT_ID       # Neon project ID
TWILIO_ACCOUNT_SID    # Twilio account SID
TWILIO_AUTH_TOKEN     # Twilio auth token
TWILIO_PHONE_NUMBER   # Twilio phone number
WHOP_API_KEY          # Whop API key
WHOP_APP_ID           # Whop app ID
```

Optional variables:

```bash
NEXT_PUBLIC_WHOP_CORE_PLAN_ID  # Whop plan ID for fast-track checkout
WHOP_WEBHOOK_SECRET            # Whop webhook signature secret
```

## Common Tasks

### Adding a New API Route

1. Create `app/api/[name]/route.ts`
2. Export handler functions (GET, POST, etc.)
3. Return structured JSON responses
4. Add input validation
5. Handle errors gracefully

### Adding a New Page

1. Create `app/[route]/page.tsx`
2. Use async params if dynamic
3. Export default function component
4. Add to navigation if needed

### Adding a New Component

1. Create in `components/ui/` for primitives
2. Create in `components/` for features
3. Use forwardRef for DOM elements
4. Export from `components/ui/index.ts` if needed

### Modifying the Wizard

1. Wizard state lives in `components/whop-wizard/whop-wizard-engine.tsx`
2. Steps are numbered 1-9 (9 is the conversion gate)
3. Blueprint fetching happens on step 8 transition via `useEffect`
4. Lead logging posts to `/api/leads` with `serviceType: whop-queue:<niche>:<goal>`

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `bun run db:push`
3. Update seed script if needed
4. Test with existing data

## Testing

### API Testing

```bash
# Test blueprint generation (Whop wizard payload)
curl -X POST http://localhost:3000/api/generate-blueprint \
  -H "Content-Type: application/json" \
  -d '{
    "communityName": "Apex Traders",
    "niche": "Trading / Finance",
    "memberCount": 500,
    "pricePerMonth": 25,
    "primaryGoal": "Increase Revenue",
    "appIdea": "Trading performance dashboard",
    "launchTimeline": "ASAP / within 1 week"
  }'

# Test lead creation
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"clientSlug":"test","name":"Test","phone":"+1234567890"}'
```

### Build Verification

```bash
# TypeScript check
bunx tsc --noEmit

# Build check
bun run build
```

## Security

1. Never commit `.env` files
2. Use environment variables for secrets
3. Validate all input data
4. Use parameterized queries (Prisma)
5. Verify webhook signatures

## Performance

1. Use server components by default
2. Add `"use client"` only when needed
3. Optimize database queries
4. Use connection pooling (Neon)
5. Use CSS transitions for animations (no external animation deps)

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [Contributing](docs/CONTRIBUTING.md)

## Support

- GitHub Issues: https://github.com/rihanaws/afilo-webmanagement-whop/issues