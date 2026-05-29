-- =========================================================
-- Police Station — initial schema
-- Matches the ERD: stations, departments, ranks, officers,
-- persons, complaints, cases, arrests, charges, evidence.
-- =========================================================

-- ---------- Core reference tables ----------

create table police_station (
    station_id text primary key,
    name       text not null,
    address    text,
    phone      text
);

create table department (
    department_id text primary key,
    station_id    text not null references police_station(station_id) on delete restrict,
    name          text not null,
    description   text
);

create table rank (
    rank_id text primary key,
    title   text not null unique,
    level   int  not null
);

create table officer (
    officer_id    text primary key,
    station_id    text not null references police_station(station_id) on delete restrict,
    department_id text references department(department_id)           on delete set null,
    rank_id       text references rank(rank_id)                       on delete set null,
    badge_number  text not null unique,
    name          text not null,
    phone         text,
    join_date     date
);

create table person (
    person_id   text primary key,
    name        text not null,
    national_id text unique,
    address     text,
    phone       text,
    dob         date,
    gender      text check (gender in ('M', 'F', 'X'))
);

create table crime_type (
    crime_type_id text primary key,
    name          text not null unique,
    severity      text check (severity in ('low', 'medium', 'high', 'critical')),
    description   text
);

-- ---------- Workflow tables ----------

create table complaint (
    complaint_id   text primary key,
    complainant_id text not null references person(person_id)  on delete restrict,
    officer_id     text not null references officer(officer_id) on delete restrict,
    filed_at       timestamptz not null default now(),
    description    text,
    status         text not null default 'open'
                       check (status in ('open', 'under_review', 'converted', 'rejected'))
);

create table "case" (
    case_id          text primary key,
    -- ||--o| in the ERD: at most one case per complaint.
    complaint_id     text unique references complaint(complaint_id) on delete set null,
    crime_type_id    text references crime_type(crime_type_id)     on delete restrict,
    lead_officer_id  text references officer(officer_id)           on delete set null,
    opened_date      date not null default current_date,
    closed_date      date,
    status           text not null default 'open'
                          check (status in ('open', 'investigating', 'closed', 'cold')),
    check (closed_date is null or closed_date >= opened_date)
);

create table case_assignment (
    case_id       text not null references "case"(case_id)    on delete cascade,
    officer_id    text not null references officer(officer_id) on delete restrict,
    assigned_date date not null default current_date,
    role          text,
    primary key (case_id, officer_id)
);

create table person_involvement (
    case_id   text not null references "case"(case_id)  on delete cascade,
    person_id text not null references person(person_id) on delete restrict,
    role      text not null
                  check (role in ('victim', 'witness', 'suspect', 'informant', 'other')),
    notes     text,
    primary key (case_id, person_id, role)
);

create table arrest (
    arrest_id   text primary key,
    case_id     text not null references "case"(case_id)    on delete restrict,
    person_id   text not null references person(person_id)   on delete restrict,
    officer_id  text not null references officer(officer_id) on delete restrict,
    arrested_at timestamptz not null default now(),
    location    text
);

create table charge (
    charge_id     text primary key,
    arrest_id     text not null references arrest(arrest_id)         on delete cascade,
    crime_type_id text not null references crime_type(crime_type_id) on delete restrict,
    description   text,
    status        text not null default 'pending'
                       check (status in ('pending', 'filed', 'dropped', 'convicted', 'acquitted'))
);

create table evidence (
    evidence_id              text primary key,
    case_id                  text not null references "case"(case_id)    on delete cascade,
    collected_by_officer_id  text references officer(officer_id)         on delete set null,
    evidence_type            text,
    description              text,
    collected_at             timestamptz not null default now()
);

-- ---------- Helpful indexes on foreign keys ----------

create index on department          (station_id);
create index on officer             (station_id);
create index on officer             (department_id);
create index on officer             (rank_id);
create index on complaint           (complainant_id);
create index on complaint           (officer_id);
create index on "case"              (crime_type_id);
create index on "case"              (lead_officer_id);
create index on case_assignment     (officer_id);
create index on person_involvement  (person_id);
create index on arrest              (case_id);
create index on arrest              (person_id);
create index on arrest              (officer_id);
create index on charge              (arrest_id);
create index on charge              (crime_type_id);
create index on evidence            (case_id);
create index on evidence            (collected_by_officer_id);
