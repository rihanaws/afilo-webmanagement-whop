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

## Directory Structure

```
afilo-webmanagement-whop/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── leads/route.ts        # Lead ingestion + SMS dispatch
│   │   ├── whop-webhook/route.ts # Whop membership sync
│   │   └── generate-blueprint/route.ts # AI proposal generator
│   ├── dashboard/page.tsx        # Client portal
│   ├── experiences/[experienceId]/page.tsx # Assessment wizard
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Tailwind v4 theme
├── components/
│   ├── ui/                       # Primitive UI components
│   ├── onboarding-intake-form.tsx
│   └── lead-activity-table.tsx
├── lib/
│   ├── prisma.ts                 # Prisma Client singleton
│   ├── twilio.ts                 # Twilio client
│   └── whop.ts                   # Whop SDK client
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seed script
├── types/
│   └── preview.ts                # TypeScript interfaces
├── proxy.ts                      # Next.js middleware
└── prisma.config.ts              # Prisma configuration
```

## Data Flow

### Lead Capture Flow

```
1. Customer submits form on preview site
   ↓
2. POST /api/leads (clientSlug, customerName, customerPhone, serviceType)
   ↓
3. Validate client exists and subscription is ACTIVE
   ↓
4. Write LeadCapture record to Neon DB
   ↓
5. Dispatch SMS via Twilio to client's contactPhone
   ↓
6. Return success response with leadId
```

### Whop Webhook Flow

```
1. Whop sends webhook event (membership change)
   ↓
2. POST /api/whop-webhook
   ↓
3. Verify webhook signature
   ↓
4. Update Client.status in database
   ↓
5. Return success response
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
- `description`: Ticket description
- `status`: OPEN | IN_PROGRESS | COMPLETED
- `slaDeadline`: 48 business hours from creation

### LeadCapture Model
- `id`: Unique identifier (CUID)
- `clientId`: Foreign key to Client
- `customerName`: Lead name
- `customerPhone`: Lead phone
- `serviceType`: Service requested (optional)
- `smsSent`: SMS delivery status (default: false)

## API Endpoints

### POST /api/leads

Ingests a new lead and dispatches SMS notification.

**Request:**
```json
{
  "clientSlug": "austin-apex-plumbing",
  "customerName": "John Miller",
  "customerPhone": "+15125550199",
  "serviceType": "Emergency Drain Cleaning"
}
```

**Response (200):**
```json
{
  "success": true,
  "leadId": "cmszavyfx00005zs1tor6wbu7",
  "smsDispatched": false
}
```

### POST /api/whop-webhook

Receives Whop webhook events for membership sync.

### POST /api/generate-blueprint

Generates a website blueprint based on business info.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEON_API_KEY` | Yes | Neon API key for branch management |
| `NEON_PROJECT_ID` | Yes | Neon project ID |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes | Twilio phone number |
| `WHOP_API_KEY` | Yes | Whop API key |
| `WHOP_APP_ID` | Yes | Whop app ID |
| `WHOP_WEBHOOK_SECRET` | No | Whop webhook signature secret |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: http://localhost:3000) |
| `NEXT_PUBLIC_PREVIEW_BASE_URL` | No | Preview base URL |
