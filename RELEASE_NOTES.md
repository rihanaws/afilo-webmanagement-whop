# Release Notes

## v1.2.0 (2026-08-19)

**Security Hardening & Client Ops Tooling**

### What's New

- **Client Operations Portal** - New dashboard at `/dashboard` (current client), `/dashboard/[companyId]`, and `/dashboard/admin` with intake form, lead activity table, and edit ticket submission
- **SLA Edit Tickets** - 48-business-hour SLA deadlines with monthly edit allowance enforcement (`/api/tickets`)
- **Rate Limiting** - Upstash Redis sliding-window limits on `/api/leads` (20/10s) and `/api/generate-blueprint` (10/10s)
- **Webhook Verification** - Real HMAC-SHA256 signature verification (`lib/whop-webhook.ts`) + optional IP allowlisting (`WHOP_WEBHOOK_ALLOWED_IPS`)
- **Waitlist Pipeline** - `LeadType` enum (`INQUIRY | WAITLIST`); wizard waitlist signups no longer dispatch SMS
- **Automated Tests** - 42 Vitest tests covering SLA, webhook, blueprint, and rate-limit logic (`bun run test`)

### Endpoint Changes

| Endpoint | Method | Change |
|----------|--------|--------|
| `/api/leads` | POST | + rate limit, `leadType` classification |
| `/api/whop-webhook` | POST | HMAC verification + IP allowlist, SDK v0.0.42 payload |
| `/api/generate-blueprint` | POST | + rate limit, logic moved to `lib/blueprint.ts` |
| `/api/client/onboarding` | POST | New |
| `/api/tickets` | POST | New |

### New Environment Variables

- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL (required for rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token (required)
- `WHOP_WEBHOOK_SECRET` - Webhook signature secret (required in production)
- `WHOP_WEBHOOK_ALLOWED_IPS` - Comma-separated webhook source IP allowlist (optional)

---

## v1.1.0 (2026-08-19)

**Whop Interactive App Experience**

This release introduces the core monetization engine for Afilo — an interactive assessment wizard running inside Whop's creator hub that collects community metrics, anchors financial loss via a dynamic churn calculator, generates 3 AI-tailored software blueprints, and gates the build with a "~4 Week Free Queue" vs. "Skip the Line (Fast-Track Checkout)" funnel.

### What's New

#### Interactive Assessment Wizard (`/experiences/[experienceId]`)

- **9-Step Flow** - From community info to conversion gate
- **Community Info** - Auto-detects or accepts community title
- **Niche Selector** - 6 interactive tiles with orange active borders
- **Member Slider** - 10 to 10,000+ with numeric fallback
- **Price Slider** - $5 to $500+/mo with numeric fallback
- **Churn Anchor** - Animated `$X,XXX / year` revenue loss badge with monthly breakdown
- **Goal Selector** - 6 primary goals + optional app idea textarea
- **Timeline Selector** - ASAP / 1 month / 2+ months
- **Blueprint Selection** - 3 AI-tailored cards with feature bullets
- **Conversion Gate** - Skip-the-line fast-track (3 days) vs. free queue (~4 weeks)

#### Blueprint Generation API

- Deterministic churn model: `memberCount × pricePerMonth × 0.12 × 12`
- 6 niche × 3 blueprint templates with contextual feature synthesis
- 6 primary goal modifiers that transform feature lists
- Dynamic app idea injection into rationale

#### Conversion Funnel

- **Primary CTA**: "Skip the Line (Fast-Track in 3 Days)" → Whop checkout
- **Secondary CTA**: "I'll wait — keep my free spot" → confirmation modal + lead logging

### Technical Highlights

- Next.js 16 async route params (`Promise<{ experienceId: string }>`)
- Animated CSS transitions (zero external animation deps)
- Full input validation with 400 error responses
- Responsive from 375px mobile to 1440px desktop
- Type-safe throughout (TypeScript strict mode)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | POST | Create lead + dispatch SMS |
| `/api/whop-webhook` | POST | Handle Whop webhooks |
| `/api/generate-blueprint` | POST | Churn calc + blueprint generation |

### Environment Variables

See [SETUP.md](docs/SETUP.md) for complete configuration. New variable:

- `NEXT_PUBLIC_WHOP_CORE_PLAN_ID` - Whop plan ID for fast-track checkout (defaults to `plan_9B7W0HkHBLinl`)

---

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

### Known Issues

- Twilio SMS requires valid credentials (currently returns `smsDispatched: false`)
- Whop webhook signature verification is placeholder (needs SDK integration)

### Upgrade Path

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
