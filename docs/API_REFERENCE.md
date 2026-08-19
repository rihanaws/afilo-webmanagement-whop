# API Reference

## POST /api/leads

Ingests a new lead and dispatches SMS notification to the client.

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
}
```

**Required Fields:** `clientSlug` (or `slug`), `customerName` (or `name`), `customerPhone` (or `phone`)

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
  "smsDispatched": false
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

Receives Whop webhook events for membership synchronization.

### Request

**Headers:**
```
Content-Type: application/json
x-whop-signature: <signature>
```

**Body:**
```typescript
{
  event: string;           // Webhook event type
  data: {
    membership_id: string;
    user_id: string;       // Whop user ID
    status: "active" | "canceled" | "past_due";
    plan_id: string;
  }
}
```

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

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid webhook signature"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Client not found for the given user_id"
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

### Churn Calculation

The deterministic agency retention model:

```typescript
const annualLoss = Math.round(memberCount * pricePerMonth * 0.12 * 12);
const monthlyLoss = Math.round(annualLoss / 12);
```

Based on a 12% annual churn benchmark for paid communities.