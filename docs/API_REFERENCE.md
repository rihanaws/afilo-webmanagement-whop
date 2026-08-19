# API Reference

> **Rate Limiting:** All public POST endpoints (`/api/leads`, `/api/generate-blueprint`) are rate-limited per IP via Upstash Redis. When the limit is exceeded the API returns `429 Too Many Requests` with `Retry-After: 10` and `x-ratelimit-*` headers.

## POST /api/leads

Ingests a new lead and dispatches SMS notification to the client. Waitlist signups (`WAITLIST`) are stored without dispatching an SMS.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
{
  clientSlug?: string;      // Website slug (or use "slug")
  slug?: string;            // Alternative to clientSlug
  customerName?: string;    // Lead name (or use "name")
  name?: string;            // Alternative to customerName
  customerPhone?: string;   // Lead phone (or use "phone")
  phone?: string;           // Alternative to customerPhone
  serviceType?: string;     // Service requested (or use "service")
  service?: string;         // Alternative to serviceType
  leadType?: string;        // Optional - "INQUIRY" (default) | "WAITLIST"
}
```

**Required Fields:** `clientSlug` (or `slug`), `customerName` (or `name`), `customerPhone` (or `phone`)

**Lead Classification:** A lead is stored as `WAITLIST` when `leadType === "WAITLIST"` or `customerPhone === "whop_lead"`. Waitlist leads skip Twilio SMS dispatch entirely.

### Examples

**Using descriptive keys:**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "clientSlug": "austin-apex-plumbing",
    "customerName": "John Miller",
    "customerPhone": "+15125550199",
    "serviceType": "Emergency Drain Cleaning"
  }'
```

**Using shorthand keys:**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "austin-apex-plumbing",
    "name": "John Miller",
    "phone": "+15125550199",
    "service": "Emergency Drain Cleaning"
  }'
```

**Wizard queue lead (from "I'll wait" CTA):**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "clientSlug": "apex-traders",
    "customerName": "Apex Traders",
    "customerPhone": "whop_lead",
    "serviceType": "whop-queue:Trading / Finance:Increase Revenue"
  }'
```

### Responses

**200 OK:**
```json
{
  "success": true,
  "leadId": "cmszavyfx00005zs1tor6wbu7",
  "leadType": "INQUIRY",
  "smsDispatched": false
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "Too many requests. Please try again shortly."
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields: clientSlug (or slug), customerName (or name), customerPhone (or phone)"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Client subscription is not active"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Website with slug 'austin-apex-plumbing' not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## POST /api/whop-webhook

Receives Whop webhook events for membership synchronization. All incoming requests are verified with an HMAC-SHA256 signature (via `x-whop-signature`) and, when configured, an IP allowlist.

### Request

**Headers:**
```
Content-Type: application/json
x-whop-signature: <HMAC-SHA256 hex digest of the raw body>
```

**Body (SDK v0.0.42 event shape):**
```typescript
{
  id: string;                      // Unique webhook request ID
  api_version: "v1";
  type: "membership.activated"
      | "membership.deactivated"
      | "membership.cancel_at_period_end_changed";
  timestamp: string;               // ISO 8601
  company_id?: string | null;
  data: {
    id: string;                    // Membership ID
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    status: "active" | "trialing" | "past_due" | "canceled" | "expired" | "completed";
    user: {
      id: string;                  // Whop user ID (mapped to Client.whopUserId)
      username: string | null;
      email: string | null;
    } | null;
    plan: {
      id: string;
      title: string;
    } | null;
  };
}
```

**Status Mapping:**
| Event type | Client.status |
|-----------|---------------|
| `membership.activated` | `ACTIVE` |
| `membership.deactivated` | `CANCELED` |
| `membership.cancel_at_period_end_changed` | `PAST_DUE` if `data.status === "past_due"`, else `ACTIVE` |

### Responses

**200 OK:**
```json
{
  "success": true,
  "data": {
    "clientId": "cmszav3tq0000c2s1pq8jktv5",
    "status": "ACTIVE",
    "updatedAt": "2026-08-18T12:00:00.000Z"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid webhook payload"
}
```

**401 Unauthorized (bad or missing signature, or missing secret in production):**
```json
{
  "success": false,
  "error": "Invalid webhook signature"
}
```

**403 Forbidden (source IP not in `WHOP_WEBHOOK_ALLOWED_IPS`):**
```json
{
  "success": false,
  "error": "Webhook source IP is not allowed"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Client not found for the given user id"
}
```

---

## POST /api/client/onboarding

Updates a client's business, domain, registrar, phone, and brand configuration.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
{
  clientId?: string;        // Client ID (used when no x-whop-user-id header)
  businessName?: string;    // Business name
  domain?: string;          // Website domain (e.g. austinapexplumbing.com)
  registrar?: string;       // Domain registrar name (GoDaddy, Namecheap, ...)
  contactPhone?: string;    // SMS notification phone (must include country code)
  primaryColor?: string;    // Hex color (e.g. #ea580c)
  stagingApproved?: boolean; // Staging site approval flag
}
```

**Alternative auth:** Pass `x-whop-user-id` header instead of `clientId` to resolve the client by `whopUserId`.

**Validation:**
- `primaryColor` must match `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`
- `contactPhone` must match `^\+[1-9]\d{6,14}$`
- `domain` must contain a dot

### Example

```bash
curl -X POST http://localhost:3000/api/client/onboarding \
  -H "Content-Type: application/json" \
  -H "x-whop-user-id: user_test_123" \
  -d '{
    "businessName": "Austin Apex Plumbing",
    "domain": "austinapexplumbing.com",
    "registrar": "GoDaddy",
    "contactPhone": "+15125550199",
    "primaryColor": "#ea580c",
    "stagingApproved": true
  }'
```

### Responses

**200 OK:**
```json
{
  "success": true,
  "data": {
    "clientId": "cmszav3tq0000c2s1pq8jktv5",
    "updatedAt": "2026-08-19T12:00:00.000Z"
  }
}
```

**400 Bad Request (validation failure):**
```json
{
  "success": false,
  "error": "contactPhone must include a country code (e.g. +15125550199)"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Client not found. Provide clientId in the body or x-whop-user-id header."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## POST /api/tickets

Creates an SLA edit ticket with a 48-business-hour deadline and enforces the monthly edit allowance.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
{
  clientId?: string;        // Client ID (used when no x-whop-user-id header)
  title: string;            // Required - minimum 3 characters
  category?: string;        // One of: "Text Change" | "Pricing Update" | "Image Swap" | "Other" (default "Other")
  description: string;      // Required - minimum 10 characters
  urgent?: boolean;         // Default false
}
```

**Alternative auth:** Pass `x-whop-user-id` header instead of `clientId`.

**SLA Rules:**
- Rejects with 400 when `usedEditMin >= monthlyEditMin` (allowance exhausted)
- Increments `usedEditMin` by 1 on creation
- `slaDeadline` = now + 48 business hours (Mon–Fri, 9am–5pm, UTC)

### Example

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -H "x-whop-user-id: user_test_123" \
  -d '{
    "title": "Update pricing on services page",
    "category": "Pricing Update",
    "description": "Change the water heater replacement price to $1,850.",
    "urgent": true
  }'
```

### Responses

**200 OK:**
```json
{
  "success": true,
  "data": {
    "ticketId": "cmszb1hkh0000wm2s1abc12345",
    "status": "OPEN",
    "slaDeadline": "2026-08-21T16:00:00.000Z",
    "usedEditMin": 1,
    "monthlyEditMin": 60
  }
}
```

**400 Bad Request (validation or exhausted allowance):**
```json
{
  "success": false,
  "error": "Monthly SLA edit minutes exhausted"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Client not found. Provide clientId in the body or x-whop-user-id header."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## POST /api/generate-blueprint

Calculates churn metrics and synthesizes 3 contextual blueprint options for the Whop assessment wizard.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
{
  communityName: string;       // Required - community name
  niche: string;               // Required - one of:
                               //   "SaaS / Tech / AI"
                               //   "Trading / Finance"
                               //   "Reselling"
                               //   "Coaching / Agency"
                               //   "Sports Betting"
                               //   "Gaming / Other"
  memberCount: number;         // Required - min 10
  pricePerMonth: number;       // Required - min 5
  primaryGoal: string;         // Required - one of:
                               //   "Increase Revenue"
                               //   "Reduce Churn"
                               //   "Boost Engagement"
                               //   "Automate Operations"
                               //   "Build a Custom Tool"
                               //   "Launch a SaaS"
  appIdea: string;             // Required - may be empty string
  launchTimeline: string;      // Required - one of:
                               //   "ASAP / within 1 week"
                               //   "Within a month"
                               //   "2 months+"
  selectedBlueprintId?: string; // Optional - "option_a" | "option_b" | "option_c"
}
```

### Example

```bash
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
```

### Responses

**200 OK:**
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
      "tagline": "Consolidate all your trading accounts, positions, and P&L into a unified command center.",
      "features": [
        "[Revenue Focus] Multi-broker account aggregation with real-time sync",
        "[Revenue Focus] Position sizing calculator with risk-per-trade limits",
        "[Revenue Focus] Daily P&L breakdown with win/loss ratio analytics",
        "[Revenue Focus] Trade journal with screenshot capture and tagging",
        "Upsell and cross-sell automation to maximize ARPU"
      ],
      "whyItFits": "Managing trades across multiple brokers and strategies creates chaos. This hub gives you one clean view of every position, every dollar at risk, and every trade outcome so you can focus on execution, not spreadsheets. Built specifically around your concept: \"Trading performance dashboard\"."
    }
  ]
}
```

**400 Bad Request (invalid fields):**
```json
{
  "success": false,
  "churnMetrics": {
    "annualLoss": 0,
    "monthlyLoss": 0
  },
  "blueprints": [],
  "error": "Invalid funnel state. Please check all fields and try again."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "churnMetrics": {
    "annualLoss": 0,
    "monthlyLoss": 0
  },
  "blueprints": [],
  "error": "Internal server error. Please try again."
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "churnMetrics": {
    "annualLoss": 0,
    "monthlyLoss": 0
  },
  "blueprints": [],
  "error": "Too many requests. Please try again shortly."
}
```

### Churn Calculation

The deterministic agency retention model:

```typescript
const annualLoss = Math.round(memberCount * pricePerMonth * 0.12 * 12);
const monthlyLoss = Math.round(annualLoss / 12);
```

Based on a 12% annual churn benchmark for paid communities.