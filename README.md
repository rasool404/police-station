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
    0004_auth_and_roles.sql← (historical) Supabase-Auth-backed app_user
    0005_rls.sql           ← (historical) Row Level Security policies
    0006_report_rpc.sql    ← (historical) SECURITY DEFINER helper
    0007_local_auth.sql    ← user_account table with 3 demo logins (current)
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

## Logins

Authentication is intentionally simple for a database course: usernames
and passwords live in a `user_account` table (see `0007_local_auth.sql`,
`0012_named_accounts.sql`). Each officer and each complainant in the
seed data has their own account so the system feels populated from the
moment you sign in.

The `user_account_role_link_chk` CHECK constraint enforces that each
role has the right kind of link (citizens → a `person`, officers → an
`officer`, chef → neither). The `user_role` enum keeps roles type-safe.

Quick demo accounts (shown on the login page):

| Role | Username | Password | Linked to |
|---|---|---|---|
| citizen | `hassan.reza` | `hassan123` | PER-01 Hassan Reza |
| officer | `alex.carter` | `alex123`   | OFF-01 Alex Carter |
| chef    | `chief`       | `chief123`  | — |

### Full credentials list

Every other login follows the same pattern: `firstname.lastname` /
`firstname123` (apostrophes and hyphens stripped).

**Citizens (15):**

| Username | Password | Person |
|---|---|---|
| `hassan.reza`   | `hassan123`  | PER-01 |
| `nadia.khoury`  | `nadia123`   | PER-02 |
| `lin.zhao`      | `lin123`     | PER-04 |
| `ibrahim.conde` | `ibrahim123` | PER-05 |
| `sara.okafor`   | `sara123`    | PER-06 |
| `felix.mueller` | `felix123`   | PER-07 |
| `aisha.khan`    | `aishak123`  | PER-08 |
| `diego.costa`   | `diegoc123`  | PER-09 |
| `yuki.sato`     | `yukis123`   | PER-10 |
| `oleg.petrov`   | `oleg123`    | PER-11 |
| `amara.diallo`  | `amara123`   | PER-12 |
| `karim.hassan`  | `karim123`   | PER-13 |
| `mei.lin`       | `mei123`     | PER-14 |
| `rafael.santos` | `rafael123`  | PER-15 |
| `zara.ahmed`    | `zara123`    | PER-16 |

**Officers (16):**

| Username | Password | Officer |
|---|---|---|
| `alex.carter`    | `alex123`   | OFF-01 (B-1001) |
| `maya.singh`     | `maya123`   | OFF-02 (B-1002) |
| `jordan.lee`     | `jordan123` | OFF-03 (B-1003) |
| `priya.patel`    | `priya123`  | OFF-04 (B-2001) |
| `sam.rivera`     | `sam123`    | OFF-05 (B-2002) |
| `chen.wei`       | `chen123`   | OFF-06 (B-3001) |
| `yuki.tanaka`    | `yuki123`   | OFF-07 (B-1004) |
| `eli.mendez`     | `eli123`    | OFF-08 (B-1005) |
| `aisha.yusuf`    | `aisha123`  | OFF-09 (B-2003) |
| `diego.romero`   | `diego123`  | OFF-10 (B-2004) |
| `olivia.park`    | `olivia123` | OFF-11 (B-3002) |
| `tomas.berg`     | `tomas123`  | OFF-12 (B-3003) |
| `liam.obrien`    | `liam123`   | OFF-13 (B-4001) |
| `sofia.romano`   | `sofia123`  | OFF-14 (B-4002) |
| `rashid.alsayed` | `rashid123` | OFF-15 (B-5001) |
| `anna.volkova`   | `anna123`   | OFF-16 (B-5002) |

**Chef:** `chief` / `chief123`.

| Role | Can | Cannot |
|---|---|---|
| `citizen` | File reports (`/report/new`), see own reports (`/report/mine`) | See the org chart, other people, or cases |
| `officer` | Read everything, manage complaints/cases/arrests/charges/evidence/persons | Manage ranks, departments, stations, officers, or user accounts |
| `chef`    | Everything an officer can do, plus manage ranks (and any other reference data) | — |

Role enforcement happens in the application layer via the `requireRole`
helper in `lib/auth.ts` — every protected page calls it at the top.

### Add another account

In Supabase SQL Editor:

```sql
-- New citizen tied to an existing person
insert into user_account (user_id, username, password, role, person_id)
values ('U-CIT-02', 'amara', 'amara123', 'citizen', 'PER-12');

-- New officer tied to an existing officer record
insert into user_account (user_id, username, password, role, officer_id)
values ('U-OFF-02', 'yuki',  'yuki123',  'officer', 'OFF-07');
```

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
