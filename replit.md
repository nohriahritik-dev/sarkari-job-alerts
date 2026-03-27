# JobAlert - Indian Government Jobs Portal

## Architecture

### Artifacts
- **job-alert** (web, `/`): React + Vite frontend — dark navy (#0A1628) + saffron (#FF9933) design
- **api-server** (api, `/api`): Express backend with PostgreSQL + Drizzle ORM, scrapes real job data

### Shared Libraries
- `lib/db`: Drizzle schema + migrations (PostgreSQL)
- `lib/api-spec`: OpenAPI 3.0 YAML spec
- `lib/api-zod`: Zod schemas generated from OpenAPI spec
- `lib/api-client`: Fetch-based API client generated from spec
- `lib/api-client-react`: React Query hooks for all API endpoints

## Data Source

**Real scraped data from freejobalert.com** — NO fake/seed data.

The scraper (`artifacts/api-server/src/lib/job-scraper.ts`) works in two phases:
1. **Phase 1 (fast)**: Batch-inserts all jobs from listing pages immediately (~4 pages, ~1000 entries, filtered to non-expired)
2. **Phase 2 (enrichment)**: Visits detail pages for the 100 most recent new jobs to extract: apply URL, salary, vacancies, age limits, states, notification PDFs

Schedule:
- Full scrape: every 4 hours on startup
- Background enrichment: every 30 minutes (for jobs without apply URLs)
- Manual trigger: `POST /api/admin/refresh-jobs`

## Database Schema

Table: `jobs`
- id, title, department, category (ssc/upsc/banking/railways/defence/state-psc/police/teaching/engineering/medical/other)
- states (JSON array), ageMin, ageMax, ageRelaxation
- qualification, applicationStartDate, lastDate, examDate
- applyUrl, notificationPdfUrl, sourceName, sourceUrl
- isVerified, description, salaryRange, vacancies
- photoRequirements, signatureRequirements
- createdAt, updatedAt

## API Routes

| Route | Description |
|-------|-------------|
| GET /api/jobs | List jobs with search/filter/pagination |
| GET /api/jobs/:id | Job detail |
| GET /api/jobs/closing-soon | Jobs closing in ≤3 days |
| GET /api/jobs/count | Total active job count |
| GET /api/categories | Categories with counts |
| GET /api/states | States with counts |
| POST /api/admin/refresh-jobs | Manual scrape trigger |

## Frontend Pages

- `/` — Home: hero, search, category grid, closing-soon alerts, recent jobs
- `/jobs` — Browse with sidebar filters (category, state, qualification, search)
- `/jobs/:id` — Job detail page with apply button, salary, eligibility
- `/states` — Browse by state
- `/bookmarks` — Saved jobs (localStorage)

## Key Files

```
artifacts/api-server/src/
  index.ts              — Server entry, starts scheduler
  app.ts                — Express app setup
  routes/jobs.ts        — Job CRUD routes
  routes/admin.ts       — Admin/manual refresh route
  lib/job-scraper.ts    — Main scraper (freejobalert.com)
  lib/serialize.ts      — Date serialization helper

artifacts/job-alert/src/
  pages/home.tsx        — Landing page
  pages/jobs.tsx        — Job listing/search page
  pages/job-detail.tsx  — Individual job page
  pages/states.tsx      — States page
  pages/bookmarks.tsx   — Bookmarks page
  components/layout.tsx — Nav + footer
  components/job-card.tsx — Job card component
  lib/utils.ts          — cn(), getCategoryColor(), etc.

lib/db/src/schema/jobs.ts — Drizzle table schema
lib/api-spec/openapi.yaml — OpenAPI 3.0 spec
```

## Design System

- Background: `#0A1628` (dark navy)
- Primary accent: `#FF9933` (saffron orange)
- Secondary: `#1A2942` (panel)
- Glass panels: semi-transparent navy with backdrop blur
- Font: Inter
- Icons: Lucide React
- Animation: Framer Motion

## Dependencies

- Runtime: Node.js, Express, Drizzle ORM, PostgreSQL, cheerio (scraping), node-cron
- Frontend: React, Vite, Wouter, TanStack Query, Framer Motion, Lucide React, Tailwind CSS
- Dev: TypeScript, esbuild, pnpm workspaces
