# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
