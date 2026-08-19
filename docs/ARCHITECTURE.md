# Afilo Architecture

> High-performance web systems for local service contractors.

## System Overview

Afilo is a productized B2B digital infrastructure agency that replaces slow, outdated websites for local service contractors (HVAC, plumbers, electricians, dental clinics) with high-performance web systems and an automated lead-dispatch engine.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Bun | Package manager and runtime |
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Language | TypeScript (strict) | Type-safe development |
| Database | Neon Serverless PostgreSQL | Serverless database |
| ORM | Prisma 7 | Type-safe database access |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Auth/Billing | Whop SDK | Membership and billing |
| Telephony | Twilio | SMS lead dispatch |
| Rate Limiting | Upstash Redis + Ratelimit | Per-IP throttling of public POST endpoints |

## Directory Structure

```
afilo-webmanagement-whop/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── leads/route.ts            # Lead ingestion + SMS dispatch (INQUIRY/WAITLIST)
│   │   ├── whop-webhook/route.ts     # Whop membership sync (HMAC-verified)
│   │   ├── generate-blueprint/route.ts # Churn calculator + blueprint gen
│   │   ├── client/onboarding/route.ts  # Client intake updates
│   │   └── tickets/route.ts          # SLA edit ticket submission
│   ├── dashboard/
│   │   ├── page.tsx                  # Client ops portal (current client)
│   │   ├── [companyId]/page.tsx      # Per-company ops portal
│   │   └── admin/page.tsx            # Multi-client admin overview
│   ├── experiences/[experienceId]/page.tsx # Whop wizard page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Tailwind v4 theme
├── components/
│   ├── ui/                           # Primitive UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   └── card.tsx
│   ├── whop-wizard/                  # Interactive wizard engine
│   │   ├── whop-wizard-engine.tsx    # 9-step wizard client component
│   │   └── index.ts                  # Barrel export
│   ├── dashboard-portal.tsx          # Shared client ops portal layout
│   ├── onboarding-intake-form.tsx    # Intake form (registrar/phone/brand)
│   ├── lead-activity-table.tsx       # Leads table with search + filters
│   └── edit-ticket-modal.tsx         # SLA edit ticket submission modal
├── lib/
│   ├── prisma.ts                     # Prisma Client singleton
│   ├── twilio.ts                     # Twilio client
│   ├── whop.ts                       # Whop SDK client
│   ├── whop-webhook.ts               # HMAC signature + IP allowlist verification
│   ├── rate-limit.ts                 # Upstash rate limiters
│   ├── blueprint.ts                  # Churn calc + blueprint synthesis (pure logic)
│   ├── sla.ts                        # 48-business-hour deadline calculation
│   ├── resolve-client.ts             # clientId / x-whop-user-id resolution
│   └── portal-data.ts                # Dashboard data fetching
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Database seed script
├── types/
│   └── preview.ts                    # TypeScript interfaces
├── vitest.config.ts                  # Test configuration
├── proxy.ts                          # Next.js middleware
└── prisma.config.ts                  # Prisma configuration
```

## Data Flow

### Wizard Blueprint Generation Flow

```
1. User completes steps 1-7 of the wizard
   ↓
2. User reaches step 8 (Blueprint Selection)
   ↓
3. useEffect fires POST /api/generate-blueprint with FunnelState
   ↓
4. Route validates all fields (returns 400 on invalid)
   ↓
5. Calculates churn metrics:
   annualLoss = memberCount × pricePerMonth × 0.12 × 12
   monthlyLoss = annualLoss / 12
   ↓
6. Synthesizes 3 BlueprintOption objects from:
   NICHE_BLUEPRINT_TEMPLATES (6 niches × 3 options)
   GOAL_MODIFIERS (6 primary goals)
   appIdea injection into whyItFits
   ↓
7. Returns GenerateBlueprintResponse with status 200
   ↓
8. Wizard renders 3 selectable blueprint cards
```

### Wizard Conversion Gate Flow

```
1. User selects a blueprint on step 8
   ↓
2. User advances to step 9 (Conversion Gate)
   ↓
3. Primary CTA: "Skip the Line (Fast-Track in 3 Days)"
   → routes to Whop checkout (plan_9B7W0HkHBLinl or NEXT_PUBLIC_WHOP_CORE_PLAN_ID)
   ↓
4. Secondary CTA: "I'll wait — keep my free spot"
   → POST /api/leads with:
   clientSlug: experienceId
   customerName: communityName || "Whop Community Lead"
   customerPhone: "whop_lead"
   serviceType: `whop-queue:${niche}:${primaryGoal}`
   ↓
5. Confirmation modal displayed
```

### Lead Capture Flow

```
1. Customer submits form on preview site
   ↓
2. POST /api/leads (clientSlug, customerName, customerPhone, serviceType, leadType?)
   ↓
3. Rate limit check (Upstash sliding window, per IP; 429 on exceed)
   ↓
4. Validate client exists and subscription is ACTIVE
   ↓
5. Classify lead:
   - WAITLIST when leadType === "WAITLIST" or customerPhone === "whop_lead"
   - INQUIRY otherwise
   ↓
6. Write LeadCapture record to Neon DB
   ↓
7. INQUIRY only: dispatch SMS via Twilio to client's contactPhone
   ↓
8. Return success response with leadId + leadType
```

### Whop Webhook Flow

```
1. Whop sends webhook event (membership change) with x-whop-signature
   ↓
2. POST /api/whop-webhook
   ↓
3. Verify HMAC-SHA256 signature (401 on invalid/missing secret in prod)
   ↓
4. Verify source IP against WHOP_WEBHOOK_ALLOWED_IPS (403 when blocked)
   ↓
5. Parse SDK v0.0.42 payload: type + data.user.id + data.status
   ↓
6. Update Client.status in database
   ↓
7. Return success response
```

### SLA Edit Ticket Flow

```
1. Client opens edit ticket modal in dashboard
   ↓
2. POST /api/tickets (title, category, description, urgent, clientId)
   ↓
3. Resolve client (clientId or x-whop-user-id)
   ↓
4. Enforce allowance: reject 400 when usedEditMin >= monthlyEditMin
   ↓
5. Compute slaDeadline = now + 48 business hours (lib/sla.ts)
   ↓
6. Create EditTicket record + increment usedEditMin by 1
   ↓
7. Return ticketId + slaDeadline
```

## Database Schema

### Client Model
- `id`: Unique identifier (CUID)
- `whopUserId`: Whop user ID (unique)
- `email`: Client email (unique)
- `businessName`: Business name
- `contactPhone`: Phone for SMS alerts
- `domainName`: Optional domain
- `plan`: CORE_RETAINER | GROWTH_BUNDLE | CUSTOM_ENTERPRISE
- `status`: ACTIVE | PAST_DUE | CANCELED
- `monthlyEditMin`: SLA minutes (default: 60)
- `usedEditMin`: Used minutes (default: 0)

### Website Model
- `id`: Unique identifier (CUID)
- `clientId`: Foreign key to Client
- `slug`: URL slug (unique)
- `previewUrl`: Preview URL
- `productionUrl`: Production URL (optional)
- `niche`: contractor | clinic | salon | restaurant
- `configJson`: Brand configuration (JSON)
- `speedScore`: Core Web Vitals score (default: 99)
- `isLive`: Production status (default: false)

### EditTicket Model
- `id`: Unique identifier (CUID)
- `clientId`: Foreign key to Client
- `title`: Ticket title
- `category`: Text Change | Pricing Update | Image Swap | Other (default: Other)
- `description`: Ticket description
- `urgent`: Priority flag (default: false)
- `status`: OPEN | IN_PROGRESS | COMPLETED
- `slaDeadline`: 48 business hours from creation

### LeadCapture Model
- `id`: Unique identifier (CUID)
- `clientId`: Foreign key to Client
- `customerName`: Lead name
- `customerPhone`: Lead phone
- `serviceType`: Service requested (optional)
- `leadType`: INQUIRY | WAITLIST (default: INQUIRY)
- `smsSent`: SMS delivery status (default: false)

## API Endpoints

### POST /api/leads

Ingests a new lead and dispatches SMS notification. Rate-limited (20 req / 10s per IP). Waitlist leads skip SMS dispatch.

**Request:**
```json
{
  "clientSlug": "austin-apex-plumbing",
  "customerName": "John Miller",
  "customerPhone": "+15125550199",
  "serviceType": "Emergency Drain Cleaning",
  "leadType": "INQUIRY"
}
```

**Response (200):**
```json
{
  "success": true,
  "leadId": "cmszavyfx00005zs1tor6wbu7",
  "leadType": "INQUIRY",
  "smsDispatched": false
}
```

### POST /api/whop-webhook

Receives Whop webhook events for membership sync. HMAC-SHA256 verified; optional IP allowlist.

### POST /api/client/onboarding

Updates `Client` (businessName, domainName, contactPhone) and `Website.configJson` (primaryColor, domainRegistrar, stagingApproved).

### POST /api/tickets

Creates an `EditTicket` with a 48-business-hour `slaDeadline`, enforcing the monthly edit allowance.

### POST /api/generate-blueprint

Calculates churn metrics and synthesizes 3 contextual blueprint options. Rate-limited (10 req / 10s per IP).

**Request:**
```json
{
  "communityName": "Apex Traders",
  "niche": "Trading / Finance",
  "memberCount": 500,
  "pricePerMonth": 25,
  "primaryGoal": "Increase Revenue",
  "appIdea": "Trading performance dashboard",
  "launchTimeline": "ASAP / within 1 week"
}
```

**Response (200):**
```json
{
  "success": true,
  "churnMetrics": {
    "annualLoss": 18000,
    "monthlyLoss": 1500
  },
  "blueprints": [
    {
      "id": "option_a",
      "badge": "Operations",
      "title": "Portfolio Operations Hub",
      "tagline": "Consolidate all your trading accounts...",
      "features": ["..."],
      "whyItFits": "..."
    }
  ]
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEON_API_KEY` | Yes | Neon API key for branch management |
| `NEON_PROJECT_ID` | Yes | Neon project ID |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes | Twilio phone number |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token |
| `WHOP_API_KEY` | Yes | Whop API key |
| `WHOP_APP_ID` | Yes | Whop app ID |
| `WHOP_WEBHOOK_SECRET` | Prod | Whop webhook signature secret (required in production, 401 when missing) |
| `WHOP_WEBHOOK_ALLOWED_IPS` | No | Comma-separated IP allowlist for webhook delivery (403 when blocked) |
| `NEXT_PUBLIC_WHOP_CORE_PLAN_ID` | No | Whop plan ID for fast-track checkout |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: http://localhost:3000) |
| `NEXT_PUBLIC_PREVIEW_BASE_URL` | No | Preview base URL |