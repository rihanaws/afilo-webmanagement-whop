# Afilo

> High-performance web systems for local service contractors.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![Bun](https://img.shields.io/badge/Bun-1.3.14-FBF0DF?logo=bun)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/rihanaws/afilo-webmanagement-whop/pulls)

---

## Overview

Afilo replaces slow, outdated websites for local service contractors (HVAC, plumbers, electricians, dental clinics) with high-performance web systems and an automated lead-dispatch engine.

### Key Features

- **5-Minute Micro-Demo Engine** - Generate live preview sites instantly
- **$200/mo Managed Retainer** - Hosting, SSL, Core Web Vitals maintenance
- **Instant SMS Lead Routing** - Twilio-powered lead dispatch
- **Client Portal** - Embedded in Whop ecosystem
- **Whop Integration** - Membership and billing management
- **Interactive Assessment Wizard** - 8-step churn calculator + blueprint generator
- **Conversion Funnel** - Skip-the-line fast-track vs. free queue monetization

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh/) |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict) |
| Database | [Neon](https://neon.tech/) Serverless PostgreSQL |
| ORM | [Prisma 7](https://www.prisma.io/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Auth/Billing | [Whop SDK](https://whop.com/) |
| Telephony | [Twilio](https://www.twilio.com/) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.3.14 or later
- [Node.js](https://nodejs.org/) v20 or later
- [Neon](https://neon.tech/) account
- [Twilio](https://www.twilio.com/) account
- [Whop](https://whop.com/) account

### Installation

```bash
# Clone the repository
git clone https://github.com/rihanaws/afilo-webmanagement-whop.git
cd afilo-webmanagement-whop

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
bun run db:push
bun run db:seed

# Start development server
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

## Project Structure

```
afilo-webmanagement-whop/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── leads/route.ts            # Lead ingestion + SMS dispatch
│   │   ├── whop-webhook/route.ts     # Whop membership sync
│   │   └── generate-blueprint/route.ts # Churn calculator + blueprint gen
│   ├── dashboard/page.tsx            # Client portal
│   ├── experiences/[experienceId]/page.tsx # Whop wizard page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Tailwind v4 theme
├── components/
│   ├── ui/                           # Primitive UI components
│   ├── whop-wizard/                  # Interactive wizard engine
│   │   ├── whop-wizard-engine.tsx    # 9-step wizard client component
│   │   └── index.ts                  # Barrel export
│   ├── onboarding-intake-form.tsx
│   └── lead-activity-table.tsx
├── lib/
│   ├── prisma.ts                     # Prisma Client singleton
│   ├── twilio.ts                     # Twilio client
│   └── whop.ts                       # Whop SDK client
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Database seed script
├── types/
│   └── preview.ts                    # TypeScript interfaces
├── docs/                             # Documentation
├── proxy.ts                          # Next.js middleware
└── prisma.config.ts                  # Prisma configuration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads` | Ingest lead + dispatch SMS |
| POST | `/api/whop-webhook` | Whop membership sync |
| POST | `/api/generate-blueprint` | Churn calculator + blueprint generation |

## Interactive Wizard

The Whop Interactive App Experience runs at `/experiences/[experienceId]` and includes:

1. **Community Info** - Collects community name
2. **Niche Selector** - 6 category tiles (SaaS, Trading, Reselling, Coaching, Sports Betting, Gaming)
3. **Member Count** - Slider (10-10,000+) with numeric input
4. **Price per Month** - Slider ($5-$500+) with numeric input
5. **Churn Anchor** - Animated revenue loss calculator (`$X,XXX/year`)
6. **Primary Goal** - 6 goal buttons + optional app idea textarea
7. **Launch Timeline** - 3 options (ASAP, 1 month, 2+ months)
8. **Blueprint Selection** - 3 AI-tailored options fetched from API
9. **Conversion Gate** - Skip-the-line checkout vs. free queue

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [API Reference](docs/API_REFERENCE.md) - Complete API documentation
- [Setup Guide](docs/SETUP.md) - Development environment setup
- [Deployment](docs/DEPLOYMENT.md) - Production deployment guide
- [Security](docs/SECURITY.md) - Security practices and guidelines
- [Contributing](docs/CONTRIBUTING.md) - Contribution guidelines

## Environment Variables

See [docs/SETUP.md](docs/SETUP.md) for complete environment variable documentation.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [Documentation](docs/)
- [Issue Tracker](https://github.com/rihanaws/afilo-webmanagement-whop/issues)
- [Discussions](https://github.com/rihanaws/afilo-webmanagement-whop/discussions)

---

Built with Next.js, React, and Tailwind CSS
