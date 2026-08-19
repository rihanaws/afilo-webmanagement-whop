# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-19

### Added

- **Whop Interactive App Experience**
  - 9-step interactive assessment wizard at `/experiences/[experienceId]`
  - Community information confirmation (auto-detects community title)
  - Niche selector grid (6 categories: SaaS/Tech/AI, Trading/Finance, Reselling, Coaching/Agency, Sports Betting, Gaming/Other)
  - Active paying members slider (Range: 10 to 10,000+ with numeric input fallback)
  - Average monthly price per member slider (Range: $5 to $500+/mo)
  - Churn anchor screen with animated `$X,XXX / year` revenue loss badge and monthly breakdown
  - Primary goal selector (6 buttons) + optional app idea textarea
  - Launch timeline selector (ASAP / within 1 week, Within a month, 2 months+)
  - Dynamic 3-card blueprint selection with loading state
  - Conversion gate with "Skip the Line (Fast-Track in 3 Days)" and "I'll wait — keep my free spot" CTAs
  - Confirmation modal on free-queue signup
  - Lead logging to `/api/leads` with `serviceType: whop-queue:<niche>:<primaryGoal>`

- **Blueprint Generation API (`/api/generate-blueprint`)**
  - Complete rewrite to accept `FunnelState` payload
  - Deterministic churn calculation: `annualLoss = memberCount × pricePerMonth × 0.12 × 12`
  - Hybrid matrix + dynamic interpolation for blueprint synthesis
  - 6 niche templates × 3 blueprint options (Operations Command Center, Engagement Engine, ROI & Growth Tracker)
  - 6 primary goal modifiers that transform feature lists
  - Dynamic `appIdea` injection into `whyItFits` rationale
  - Full input validation returning 400 on invalid payloads

- **New Types**
  - `NicheCategory` - 6-option union type
  - `PrimaryGoal` - 6-option union type
  - `FunnelState` - 9-field wizard state interface
  - `BlueprintOption` - Blueprint card interface
  - `GenerateBlueprintResponse` - API response wrapper

- **Experience Page (`/experiences/[experienceId]`)**
  - Rewritten as server component wrapper
  - Next.js 16 async params pattern (`Promise<{ experienceId: string }>`)
  - Renders `WhopWizardEngine` with Whop Frosted dark styling
  - `min-h-screen bg-[#0c0d0e]` layout

- **Wizard Components**
  - `components/whop-wizard/whop-wizard-engine.tsx` - Main client engine
  - `components/whop-wizard/index.ts` - Barrel export
  - Animated step transitions (CSS only, no external deps)
  - Progress bar with step indicators
  - Responsive design (375px mobile to 1440px desktop)

### Changed

- `app/api/generate-blueprint/route.ts` - Replaced site-blueprint generator with churn calculator + blueprint synthesizer
- `app/experiences/[experienceId]/page.tsx` - Replaced static website config display with interactive wizard
- `types/preview.ts` - Added wizard types (kept existing types for backward compatibility)

---

## [1.0.0] - 2026-08-18

### Added

- **Core Infrastructure**
  - Next.js 16.3.1 with App Router
  - React 19.2.8
  - TypeScript 5.x (strict mode)
  - Tailwind CSS 4.x with custom theme
  - Bun 1.3.14 package manager

- **Database**
  - Prisma 7 ORM with Neon Serverless PostgreSQL
  - Client, Website, EditTicket, LeadCapture models
  - Subscription and ticket status enums
  - Database seed script for test data

- **API Routes**
  - `POST /api/leads` - Lead ingestion with SMS dispatch
  - `POST /api/whop-webhook` - Whop membership synchronization
  - `POST /api/generate-blueprint` - AI proposal generator

- **UI Components**
  - Button component with variants (primary, secondary, outline, ghost, destructive)
  - Input component with labels and error states
  - Card component (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
  - Badge component with variants (default, primary, success, warning, destructive)
  - Onboarding intake form component
  - Lead activity table component

- **Pages**
  - Landing page (`/`)
  - Client dashboard (`/dashboard`)
  - Experience wizard (`/experiences/[experienceId]`)

- **Middleware**
  - Root proxy middleware (Next.js 16 convention)
  - Authentication checks for protected routes

- **Integrations**
  - Twilio SMS client with lazy initialization
  - Whop SDK client for membership management
  - Prisma Client singleton for serverless environments

- **Documentation**
  - Architecture documentation
  - API reference
  - Setup guide
  - Deployment guide
  - Security documentation
  - Contributing guidelines

- **Development Tools**
  - Environment variable validation
  - Database push and seed scripts
  - Prisma Studio configuration

### Security

- Environment variables properly gitignored
- SSL connections enforced for database
- Input validation on all API routes
- Webhook signature verification for Whop

### Testing

- Lead API tested with both shorthand and descriptive key formats
- Database seed script verified
- Build process validated

---

## [0.1.0] - 2026-08-18

### Added

- Initial project setup from create-next-app
- Basic Next.js 16 configuration
- Tailwind CSS 4 integration
- TypeScript configuration
- Bun package manager setup
