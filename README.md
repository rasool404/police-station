# Police Station — Database Course Project

A Next.js admin UI on top of a Supabase (Postgres) schema for a police
station system. Built to demonstrate the ERD: stations, departments,
ranks, officers, persons, complaints, cases, arrests, charges, evidence.

## Stack
- **Database**: Supabase (Postgres 15) — schema in `supabase/migrations/`
- **App**: Next.js 15 (App Router, React 19, TypeScript)
- **Client**: `@supabase/ssr` for server + browser

## Project layout
```
supabase/
  config.toml
  migrations/
    0001_init.sql          ← schema (tables, FKs, indexes, checks)
    0002_seed.sql          ← sample data
app/
  layout.tsx, globals.css  ← shell + dark theme
  page.tsx                 ← dashboard with counts
  stations/                ← list of police stations
  officers/                ← list of officers w/ rank, station, dept
  persons/                 ← list of persons
  complaints/              ← list + "new complaint" form
  cases/                   ← list + "[id]" detail + "new" form
  actions/                 ← server actions (insert complaint, open case)
lib/
  supabase/{server,client}.ts
  format.ts
```

## 1. Install
```sh
pnpm install           # or npm install / yarn / bun install
```

## 2. Hook up Supabase

Get your project URL + anon key from
Supabase Dashboard → Project Settings → API.

```sh
cp .env.local.example .env.local
# edit .env.local and paste the values
```

## 3. Push the schema

Install the CLI if you don't have it:
```sh
brew install supabase/tap/supabase
```

Then link and push:
```sh
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push           # applies 0001_init.sql then 0002_seed.sql
```

> Alternative without CLI: open Supabase → SQL Editor → paste
> `0001_init.sql`, run; paste `0002_seed.sql`, run.

## 4. Run the app
```sh
pnpm dev
```
Open http://localhost:3000 — the dashboard should show row counts from
your seeded database.

## Demonstrating the schema

The admin UI walks through the case-management workflow end-to-end:

1. **Persons** and **Officers** exist as reference data.
2. Someone files a **Complaint** (`/complaints/new`).
3. An investigator converts it into a **Case** (`/cases/new`) — this also
   inserts the lead-officer `case_assignment` and flips the complaint
   status to `converted`.
4. The **Case detail** page (`/cases/[id]`) joins across:
   - originating complaint
   - crime type
   - lead officer + all assigned officers
   - persons involved (victim / witness / suspect)
   - arrests, each with its charges
   - evidence collected

That single page exercises every relationship in the ERD.

## Resetting / iterating

```sh
supabase db reset      # drops everything and re-applies all migrations
```

To change the schema, add a new migration file
(`supabase/migrations/0003_*.sql`) instead of editing the old ones — the
CLI applies them in order and tracks which have run.

## Notes
- All status fields use Postgres `CHECK` constraints, so invalid values
  are rejected at the DB layer.
- Composite primary keys are used for `case_assignment` and
  `person_involvement` (no surrogate IDs).
- Every foreign-key column has an index for cheap joins.
- The app uses the **anon key** only and reads/writes directly. For a
  production system you'd add Supabase Auth + Row Level Security; this
  project intentionally keeps RLS disabled for course demo purposes.
