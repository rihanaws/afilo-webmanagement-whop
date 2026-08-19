# Setup Guide

## Prerequisites

- [Bun](https://bun.sh/) v1.3.14 or later
- [Node.js](https://nodejs.org/) v20 or later (for Prisma CLI)
- [Neon](https://neon.tech/) account (PostgreSQL database)
- [Twilio](https://www.twilio.com/) account (SMS service)
- [Whop](https://whop.com/) account (membership platform)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/rihanaws/afilo-webmanagement-whop.git
cd afilo-webmanagement-whop
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEON_API_KEY="napi_xxxxxxxxxxxxxxxxxxxxxxxx"
NEON_PROJECT_ID="your-neon-project-id"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# Whop (Membership)
WHOP_API_KEY="whop_xxxxxxxxxxxxxxxxxxxxxxxx"
WHOP_APP_ID="your_whop_app_id"

# Whop (Optional - Fast-Track Checkout)
# NEXT_PUBLIC_WHOP_CORE_PLAN_ID="plan_9B7W0HkHBLinl"
```

### 4. Initialize the database

```bash
# Push schema to Neon
bun run db:push

# Seed test data
bun run db:seed
```

### 5. Start the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run db:push` | Push schema to database |
| `bun run db:seed` | Seed database with test data |
| `bun run db:studio` | Open Prisma Studio |

## Testing the API

### Create a lead

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

### Generate a blueprint (Whop wizard payload)

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

### Test the Whop wizard

Visit [http://localhost:3000/experiences/test](http://localhost:3000/experiences/test) in your browser to run the 9-step interactive assessment wizard.

## Troubleshooting

### Database connection issues

1. Verify `DATABASE_URL` is correct in `.env.local`
2. Ensure your IP is whitelisted in Neon dashboard
3. Check that SSL mode is set to `require`

### Twilio SMS not sending

1. Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
2. Ensure `TWILIO_PHONE_NUMBER` is a valid Twilio number
3. Check Twilio console for error logs

### Build failures

1. Run `bun install` to ensure all dependencies are installed
2. Check for TypeScript errors: `bunx tsc --noEmit`
3. Verify environment variables are set correctly
