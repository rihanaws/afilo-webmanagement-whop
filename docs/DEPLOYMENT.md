# Deployment Guide

## Overview

Afilo is a Next.js application designed to be deployed on Vercel or any Node.js hosting platform. This guide covers deployment to production.

## Prerequisites

- [Vercel](https://vercel.com/) account (recommended) or Node.js hosting
- [Neon](https://neon.tech/) production database
- [Twilio](https://www.twilio.com/) production account
- [Whop](https://whop.com/) production account
- Domain name (optional)

## Environment Variables

Set the following environment variables in your hosting platform:

```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Neon API
NEON_API_KEY="napi_xxxxxxxxxxxxxxxxxxxxxxxx"
NEON_PROJECT_ID="your-neon-project-id"

# Twilio
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# Whop
WHOP_API_KEY="whop_xxxxxxxxxxxxxxxxxxxxxxxx"
WHOP_APP_ID="your_whop_app_id"
WHOP_WEBHOOK_SECRET="your_whop_webhook_secret"

# Application
NEXT_PUBLIC_APP_URL="https://afilo.io"
NEXT_PUBLIC_PREVIEW_BASE_URL="https://preview.afilo.io"
```

## Deploy to Vercel

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com/)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `afilo-webmanagement-whop`

### 2. Configure Project

1. Framework Preset: Next.js
2. Root Directory: `./`
3. Build Command: `next build`
4. Output Directory: `.next`

### 3. Set Environment Variables

Add all environment variables in the Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable with the appropriate value
3. Select the appropriate environments (Production, Preview, Development)

### 4. Deploy

Click "Deploy" to start the deployment process.

### 5. Configure Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Deploy to Node.js Hosting

### 1. Build the Application

```bash
bun run build
```

### 2. Start the Production Server

```bash
bun run start
```

The server will start on port 3000 by default.

### 3. Use a Process Manager (Recommended)

For production, use a process manager like PM2:

```bash
# Install PM2
bun add -g pm2

# Start the application
pm2 start bun --name "afilo" -- run start

# Save PM2 configuration
pm2 save

# Set up startup script
pm2 startup
```

## Database Setup

### Production Database

1. Create a new Neon project for production
2. Run the schema migration:
   ```bash
   DATABASE_URL="your_production_url" bun run db:push
   ```

### Seed Production Data (Optional)

```bash
DATABASE_URL="your_production_url" bun run db:seed
```

## Webhook Configuration

### Whop Webhooks

1. Go to Whop Dashboard → Settings → Webhooks
2. Add a new webhook:
   - URL: `https://afilo.io/api/whop-webhook`
   - Events: membership.updated, membership.canceled
3. Copy the webhook secret to `WHOP_WEBHOOK_SECRET`

## Monitoring

### Health Check

Create a health check endpoint by accessing:
```
https://afilo.io/
```

### Logs

Check Vercel function logs in the dashboard or use:
```bash
vercel logs
```

## Troubleshooting

### Build Failures

1. Verify all environment variables are set
2. Check Node.js version (v20 or later)
3. Run `bun install` to ensure dependencies are installed

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Neon dashboard for connection limits
3. Ensure SSL mode is set to `require`

### Twilio SMS Issues

1. Verify Twilio credentials are correct
2. Check Twilio console for error logs
3. Ensure phone number is verified

## Security Checklist

- [ ] Environment variables are secure
- [ ] Database credentials are not exposed
- [ ] API keys are stored securely
- [ ] HTTPS is enabled
- [ ] CORS is configured properly
- [ ] Rate limiting is implemented (if needed)

## Performance Optimization

1. Enable Vercel Edge Network
2. Configure ISR for static pages
3. Optimize images with Next.js Image component
4. Enable compression
5. Configure caching headers
