# Contributing to Afilo

Thank you for your interest in contributing to Afilo! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) v1.3.14 or later
- [Node.js](https://nodejs.org/) v20 or later
- [Neon](https://neon.tech/) account (for database)

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/afilo-webmanagement-whop.git
   cd afilo-webmanagement-whop
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your credentials.

5. Start the development server:
   ```bash
   bun run dev
   ```

## Code Standards

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig)
- Avoid `any` types
- Use explicit return types for functions
- Use Prisma-generated types for database models

### Code Style

- Use Tailwind CSS for styling
- Follow the existing component patterns
- Use `clsx` and `tailwind-merge` for conditional classes
- Keep components small and focused

### File Structure

```
app/                    # Next.js App Router
├── api/                # API routes
├── dashboard/          # Client portal
├── experiences/        # Assessment wizard
├── layout.tsx          # Root layout
├── page.tsx            # Landing page
└── globals.css         # Tailwind theme

components/             # React components
├── ui/                 # Primitive UI components
└── *.tsx               # Feature components

lib/                    # Utility libraries
├── prisma.ts           # Prisma Client
├── twilio.ts           # Twilio client
└── whop.ts             # Whop SDK

prisma/                 # Database
├── schema.prisma       # Schema definition
└── seed.ts             # Seed script

types/                  # TypeScript types
└── preview.ts          # Preview interfaces
```

### Commit Messages

Use conventional commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add lead capture API endpoint
fix: resolve Twilio SMS dispatch issue
docs: update API reference documentation
```

### Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

4. Create a Pull Request with:
   - Clear title and description
   - Reference any related issues
   - Include screenshots if applicable

### Code Review

- All PRs require at least one review
- Address review comments promptly
- Keep PRs focused and small when possible

## Testing

### Running Tests

```bash
# TypeScript check
bunx tsc --noEmit

# Build check
bun run build
```

### API Testing

Test API endpoints using curl or a tool like Postman:

```bash
# Test lead creation
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"clientSlug":"test","name":"Test User","phone":"+1234567890"}'
```

## Documentation

- Update documentation for any new features
- Keep API documentation in sync with code changes
- Add JSDoc comments for complex functions

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers.
