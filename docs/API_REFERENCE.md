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

Generates a website blueprint based on business information.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
{
  businessName: string;    // Required
  niche: string;           // Required: "contractor" | "clinic" | "salon" | "restaurant"
  domain?: string;         // Optional domain name
  phone?: string;          // Optional phone number
  email?: string;          // Optional email
  address?: string;        // Optional address
}
```

### Example

```bash
curl -X POST http://localhost:3000/api/generate-blueprint \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Austin Apex Plumbing",
    "niche": "contractor",
    "domain": "austinapexplumbing.com",
    "phone": "+15125550199"
  }'
```

### Responses

**200 OK:**
```json
{
  "success": true,
  "data": {
    "slug": "austin-apex-plumbing",
    "businessName": "Austin Apex Plumbing",
    "niche": "contractor",
    "primaryColor": "#ea580c",
    "secondaryColor": "#f97316",
    "phone": "+15125550199",
    "heroHeadline": "Fast, Reliable contractor You Can Trust",
    "heroSubheadline": "Licensed and insured professionals serving your area. Call now for a free estimate.",
    "services": [
      { "name": "Emergency Repairs", "description": "24/7 same-day service" },
      { "name": "Maintenance Plans", "description": "Preventative care programs" },
      { "name": "Free Estimates", "description": "No-obligation quotes" }
    ],
    "reviews": [
      {
        "author": "Satisfied Customer",
        "rating": 5,
        "text": "Excellent service! Highly recommend to anyone looking for quality work."
      }
    ],
    "ctaText": "Get a Free Quote",
    "ctaUrl": "https://austinapexplumbing.com"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields: businessName, niche"
}
```
