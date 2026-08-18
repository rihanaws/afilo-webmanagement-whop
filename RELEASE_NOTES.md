# Release Notes

## v1.0.0 (2026-08-18)

**Initial Production Release**

We're excited to announce the first production release of Afilo - a high-performance web system for local service contractors.

### What's New

#### Core Features

- **Lead Capture System** - Capture and manage leads from preview sites
- **SMS Lead Dispatch** - Instant Twilio-powered SMS notifications
- **Client Portal** - Dashboard for managing websites and leads
- **Assessment Wizard** - 8-step onboarding flow for new clients
- **Blueprint Generator** - AI-powered website proposal generator

#### Technical Highlights

- **Next.js 16** - Latest App Router with Turbopack
- **Prisma 7** - Type-safe database access with Neon PostgreSQL
- **Tailwind CSS 4** - Custom Whop Frosted design system
- **TypeScript Strict** - Full type safety throughout

### Getting Started

1. Install dependencies: `bun install`
2. Configure environment: `cp .env.example .env.local`
3. Initialize database: `bun run db:push && bun run db:seed`
4. Start server: `bun run dev`

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | POST | Create lead + dispatch SMS |
| `/api/whop-webhook` | POST | Handle Whop webhooks |
| `/api/generate-blueprint` | POST | Generate website blueprint |

### Environment Variables

See [SETUP.md](docs/SETUP.md) for complete configuration.

### Known Issues

- Twilio SMS requires valid credentials (currently returns `smsDispatched: false`)
- Whop webhook signature verification is placeholder (needs SDK integration)

### Upgrade Path

This is the initial release. Future versions will include:

- Enhanced dashboard analytics
- More niche templates
- Automated CNAME verification
- Edit ticket workflow

---

## v0.1.0 (2026-08-18)

**Alpha Release**

Initial project scaffolding and setup.

- Next.js 16 project initialization
- Basic Tailwind CSS configuration
- TypeScript strict mode enabled
- Bun package manager configured
