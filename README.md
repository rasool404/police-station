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
    0003_more_seed.sql     ← additional mock data
    0004_auth_and_roles.sql← user_role enum, app_user junction, signup trigger
    0005_rls.sql           ← Row Level Security policies for all tables
    0006_report_rpc.sql    ← SECURITY DEFINER helper for citizen reports
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

## 3b. Enable email/password auth

In the Supabase Dashboard:
1. **Authentication → Providers → Email** — make sure it's enabled.
2. **Authentication → Sign In / Up → Confirm email** — turn this **OFF**
   for the course project so new accounts work immediately. (Production
   should keep it on.)
3. **Authentication → URL Configuration → Site URL**: `http://localhost:3000`.

## 4. Run the app
```sh
pnpm dev
```
Open http://localhost:3000 — the dashboard should show row counts from
your seeded database.

## Roles

Three roles, modeled as a Postgres `user_role` enum:

| Role | Can | Cannot |
|---|---|---|
| `citizen` | File reports (`/report/new`), see own reports (`/report/mine`), view cases derived from own reports | See other people, the org chart, or any other case |
| `officer` | Read everything, mutate complaints/cases/arrests/charges/evidence/persons | Manage ranks, departments, stations, or other officers |
| `admin` | Everything an officer can do, plus manage ranks, departments, stations, officers, and other users | — |

Access control is enforced **twice**: once in the UI (`requireRole` calls
on every page) and once in the database (Row Level Security policies on
every table). Even if a citizen crafted a raw API call to a staff-only
table, the database would reject it.

### Bootstrapping the first admin

New signups are always created as `citizen`. To promote the first user
to `admin`, run this in the Supabase SQL Editor after they sign up:

```sql
update app_user
set role = 'admin', person_id = null, officer_id = null
where user_id = (select id from auth.users where email = 'you@example.com');
```

### Promoting a citizen to officer

You need an existing `officer` row to link them to. As admin:

```sql
-- as admin, in the SQL editor:
update app_user
set role = 'officer', officer_id = 'OFF-07', person_id = null
where user_id = (select id from auth.users where email = 'yuki@station01.gov');
```

The `app_user_role_link_chk` CHECK constraint enforces that the link is
consistent with the role.

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
