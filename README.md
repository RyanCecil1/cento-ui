# Cento UI Preview

UI-first local prototype for `Cento`, a premium bulk SMS SaaS concept. This build is intentionally frontend-only and uses static mock data across the marketing site and dashboard shell.

## Stack

- Next.js App Router
- Tailwind CSS v4
- TypeScript
- `@phosphor-icons/react`

## What is included

- Public marketing website
- Signup and login UI
- Dashboard shell
- Campaign builder step flow
- Contacts, wallet, reports, AI writer, sender IDs, and settings preview pages

## What is intentionally not included

- Authentication
- SMS gateway integration
- Payments
- Database
- API routes
- Real form submission

## Local preview

Install dependencies if needed:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Key routes

- `/` marketing homepage
- `/features`
- `/pricing`
- `/industries`
- `/faq`
- `/contact`
- `/login`
- `/signup`
- `/app` dashboard overview
- `/app/campaigns`
- `/app/campaigns/new`
- `/app/contacts`
- `/app/wallet`
- `/app/reports`
- `/app/ai-writer`
- `/app/sender-ids`
- `/app/settings`

## Validation

```bash
npm run lint
npm run build
```
