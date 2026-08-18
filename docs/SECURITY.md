# Security

## Overview

Afilo takes security seriously. This document outlines security measures and best practices for the application.

## Authentication & Authorization

### Whop Integration

- All client authentication is handled via Whop OAuth
- Membership status is synced via webhooks
- Only active subscriptions can access protected resources

### API Security

- API routes validate input data
- Database queries are parameterized (Prisma ORM)
- Rate limiting should be implemented for production

## Data Protection

### Database Security

- All database connections use SSL (`sslmode=require`)
- Credentials are stored in environment variables
- Database access is restricted by IP (Neon dashboard)

### Sensitive Data

- API keys are never committed to git (`.env*` files are ignored)
- Twilio credentials are loaded at runtime
- Whop webhook signatures are verified

### PII Handling

- Customer phone numbers are stored for SMS dispatch
- Customer names are stored for lead tracking
- Data is not shared with third parties

## Environment Variables

### Required Variables

| Variable | Description | Security Level |
|----------|-------------|----------------|
| `DATABASE_URL` | Neon connection string | Critical |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | High |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Critical |
| `WHOP_API_KEY` | Whop API key | High |
| `WHOP_WEBHOOK_SECRET` | Webhook signature secret | High |

### Best Practices

1. Never commit `.env` files to version control
2. Use different credentials for development and production
3. Rotate credentials periodically
4. Use secret management services for production

## API Security

### Input Validation

All API endpoints validate input data:

```typescript
// Example from /api/leads
const clientSlug = body.clientSlug || body.slug;
const customerName = body.customerName || body.name;
const customerPhone = body.customerPhone || body.phone;

if (!clientSlug || !customerName || !customerPhone) {
  return NextResponse.json(
    { success: false, error: "Missing required fields" },
    { status: 400 }
  );
}
```

### Error Handling

- Errors are logged server-side only
- Generic error messages are returned to clients
- Stack traces are not exposed

### CORS

Configure CORS for your domain:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://afilo.io" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
        ],
      },
    ];
  },
};
```

## Webhook Security

### Signature Verification

Whop webhooks include a signature header:

```typescript
// app/api/whop-webhook/route.ts
const signature = request.headers.get("x-whop-signature");
if (!verifyWebhookSignature(rawBody, signature)) {
  return NextResponse.json(
    { success: false, error: "Invalid webhook signature" },
    { status: 401 }
  );
}
```

### IP Whitelisting

Consider whitelisting Whop's IP addresses in production.

## Database Security

### Connection Security

- Use connection pooling (Neon pooler)
- Enable SSL connections
- Restrict IP access in Neon dashboard

### Query Security

Prisma ORM provides:

- Parameterized queries (prevents SQL injection)
- Type-safe database access
- Automatic input validation

### Backup Strategy

1. Enable automatic backups in Neon
2. Test backup restoration regularly
3. Store backups in a separate location

## Deployment Security

### Vercel

- Enable Vercel's Web Application Firewall
- Configure custom domains with SSL
- Enable DDoS protection

### Environment Variables

- Use Vercel's encrypted environment variables
- Never log sensitive data
- Use different variables for preview/production

## Monitoring

### Logging

- Log API requests (without sensitive data)
- Monitor error rates
- Track failed authentication attempts

### Alerts

Set up alerts for:

- Unusual API traffic
- Failed database connections
- Twilio delivery failures
- Whop webhook failures

## Compliance

### GDPR

- Store only necessary customer data
- Provide data deletion capability
- Document data processing activities

### CCPA

- Disclose data collection practices
- Provide opt-out mechanisms
- Respond to data requests

## Security Checklist

- [ ] Environment variables are secure
- [ ] Database connections use SSL
- [ ] API input is validated
- [ ] Errors are handled securely
- [ ] Webhooks are verified
- [ ] Sensitive data is not logged
- [ ] Dependencies are up to date
- [ ] Access controls are in place
