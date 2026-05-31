-- =========================================================
-- Additional mock data to make the system feel realistic:
-- + 2 stations, 5 departments, 10 officers, 14 persons,
--   4 crime types, 10 complaints, 8 cases, 18 assignments,
--   18 involvements, 5 arrests, 6 charges, 5 evidence items.
-- All inserts are idempotent via ON CONFLICT DO NOTHING.
-- =========================================================

-- ---------- More stations ----------
insert into police_station (station_id, name, address, phone) values
  ('STN-04', 'West District',    '301 Sunset Blvd',  '+1-555-0004'),
  ('STN-05', 'Airport Station',  'Terminal C, Gate 1','+1-555-0005')
on conflict (station_id) do nothing;

-- ---------- More departments ----------
insert into department (department_id, station_id, name, description) values
  ('DEP-06', 'STN-01', 'Forensics',         'Lab analysis and crime-scene processing'),
  ('DEP-07', 'STN-02', 'Anti-Terror',       'Counter-terrorism intelligence and response'),
  ('DEP-08', 'STN-01', 'Internal Affairs',  'Investigates officer misconduct'),
  ('DEP-09', 'STN-04', 'K9 Unit',           'Canine search, tracking, and detection'),
  ('DEP-10', 'STN-05', 'Airport Security',  'Airport perimeter and passenger screening')
on conflict (department_id) do nothing;

-- ---------- More officers ----------
insert into officer (officer_id, station_id, department_id, rank_id, badge_number, name, phone, join_date) values
  ('OFF-07', 'STN-01', 'DEP-06', 'R3', 'B-1004', 'Yuki Tanaka',       '+1-555-1004', '2016-09-08'),
  ('OFF-08', 'STN-01', 'DEP-08', 'R4', 'B-1005', 'Eli Mendez',        '+1-555-1005', '2014-02-20'),
  ('OFF-09', 'STN-02', 'DEP-07', 'R5', 'B-2003', 'Aisha Yusuf',       '+1-555-2003', '2011-07-01'),
  ('OFF-10', 'STN-02', 'DEP-03', 'R3', 'B-2004', 'Diego Romero',      '+1-555-2004', '2019-04-14'),
  ('OFF-11', 'STN-03', 'DEP-05', 'R2', 'B-3002', 'Olivia Park',       '+1-555-3002', '2023-01-30'),
  ('OFF-12', 'STN-03', 'DEP-05', 'R2', 'B-3003', 'Tomas Berg',        '+1-555-3003', '2022-11-12'),
  ('OFF-13', 'STN-04', 'DEP-09', 'R3', 'B-4001', 'Liam O''Brien',     '+1-555-4001', '2018-08-25'),
  ('OFF-14', 'STN-04', 'DEP-09', 'R2', 'B-4002', 'Sofia Romano',      '+1-555-4002', '2024-03-03'),
  ('OFF-15', 'STN-05', 'DEP-10', 'R3', 'B-5001', 'Rashid Al-Sayed',   '+1-555-5001', '2017-10-17'),
  ('OFF-16', 'STN-05', 'DEP-10', 'R2', 'B-5002', 'Anna Volkova',      '+1-555-5002', '2023-06-21')
on conflict (officer_id) do nothing;

-- ---------- More persons ----------
insert into person (person_id, name, national_id, address, phone, dob, gender) values
  ('PER-07', 'Felix Mueller',    'NID-1007', '14 Maple Dr',     '+1-555-7007', '1988-03-22', 'M'),
  ('PER-08', 'Aisha Khan',       'NID-1008', '27 Rose St',      '+1-555-7008', '1992-06-10', 'F'),
  ('PER-09', 'Diego Costa',      'NID-1009', '8 Sunset Blvd',   '+1-555-7009', '1980-08-15', 'M'),
  ('PER-10', 'Yuki Sato',        'NID-1010', '102 Bay Ave',     '+1-555-7010', '1997-01-28', 'F'),
  ('PER-11', 'Oleg Petrov',      'NID-1011', '55 River Rd',     '+1-555-7011', '1975-12-03', 'M'),
  ('PER-12', 'Amara Diallo',     'NID-1012', '19 Acacia Ln',    '+1-555-7012', '1986-05-09', 'F'),
  ('PER-13', 'Karim Hassan',     'NID-1013', '63 Palm Way',     '+1-555-7013', '1993-09-17', 'M'),
  ('PER-14', 'Mei Lin',          'NID-1014', '4 Lotus Pl',      '+1-555-7014', '2012-04-02', 'F'),
  ('PER-15', 'Rafael Santos',    'NID-1015', '78 Iron St',      '+1-555-7015', '1989-11-25', 'M'),
  ('PER-16', 'Zara Ahmed',       'NID-1016', '13 Hazel Ct',     '+1-555-7016', '1996-07-07', 'F'),
  ('PER-17', 'Viktor Kowalski',  'NID-1017', '90 Steel Ave',    '+1-555-7017', '1979-02-19', 'M'),
  ('PER-18', 'Layla Mansour',    'NID-1018', '6 Jasmine Sq',    '+1-555-7018', '1994-10-30', 'F'),
  ('PER-19', 'Bao Nguyen',       'NID-1019', '31 Bamboo Rd',    '+1-555-7019', '1983-12-12', 'M'),
  ('PER-20', 'Iris Janssen',     'NID-1020', '47 Tulip St',     '+1-555-7020', '1991-04-04', 'F')
on conflict (person_id) do nothing;

-- ---------- More crime types ----------
insert into crime_type (crime_type_id, name, severity, description) values
  ('CT-07', 'Vandalism',     'medium',   'Destruction of public or private property'),
  ('CT-08', 'Burglary',      'high',     'Unlawful entry with intent to commit a crime'),
  ('CT-09', 'Kidnapping',    'critical', 'Unlawful detention or abduction of a person'),
  ('CT-10', 'Counterfeiting','medium',   'Production or circulation of forged currency')
on conflict (crime_type_id) do nothing;

-- ---------- More complaints ----------
insert into complaint (complaint_id, complainant_id, officer_id, filed_at, description, status) values
  ('CMP-06', 'PER-07', 'OFF-04', '2026-05-14 08:00:00+00', 'Drug deal observed in parking lot of 9th Ave',   'converted'),
  ('CMP-07', 'PER-08', 'OFF-15', '2026-05-17 21:45:00+00', 'Suspicious unaccompanied package at terminal B', 'converted'),
  ('CMP-08', 'PER-09', 'OFF-05', '2026-05-19 07:20:00+00', 'House broken into overnight, electronics taken', 'converted'),
  ('CMP-09', 'PER-10', 'OFF-03', '2026-05-23 16:10:00+00', 'Online dating contact extorted $2,400 USD',      'converted'),
  ('CMP-10', 'PER-11', 'OFF-05', '2026-05-25 03:30:00+00', 'Storefront window smashed, graffiti tagged',     'converted'),
  ('CMP-11', 'PER-12', 'OFF-01', '2026-05-26 19:00:00+00', 'Daughter (12) did not return from school',       'converted'),
  ('CMP-12', 'PER-13', 'OFF-03', '2026-05-29 11:30:00+00', 'Received counterfeit $100 bills as change',      'converted'),
  ('CMP-13', 'PER-14', 'OFF-13', '2026-05-30 09:00:00+00', 'Family dog stolen from front yard',              'open'),
  ('CMP-14', 'PER-15', 'OFF-02', '2026-05-18 23:50:00+00', 'Attacked outside Murphy''s Bar by known suspect','converted'),
  ('CMP-15', 'PER-16', 'OFF-08', '2026-05-31 10:15:00+00', 'Anonymous harassing messages via social media',  'under_review')
on conflict (complaint_id) do nothing;

-- ---------- More cases ----------
insert into "case" (case_id, complaint_id, crime_type_id, lead_officer_id, opened_date, closed_date, status) values
  ('CSE-05', 'CMP-06', 'CT-04', 'OFF-04', '2026-05-14', null,          'investigating'),
  ('CSE-06', 'CMP-07', 'CT-06', 'OFF-15', '2026-05-17', null,          'open'),
  ('CSE-07', 'CMP-08', 'CT-08', 'OFF-05', '2026-05-19', null,          'investigating'),
  ('CSE-08', 'CMP-09', 'CT-03', 'OFF-03', '2026-05-23', '2026-05-28', 'closed'),
  ('CSE-09', 'CMP-10', 'CT-07', 'OFF-05', '2026-05-25', null,          'open'),
  ('CSE-10', 'CMP-11', 'CT-09', 'OFF-01', '2026-05-26', null,          'investigating'),
  ('CSE-11', 'CMP-12', 'CT-10', 'OFF-03', '2026-05-29', null,          'open'),
  ('CSE-12', 'CMP-14', 'CT-02', 'OFF-02', '2026-05-18', '2026-05-22', 'closed')
on conflict (case_id) do nothing;

-- ---------- More case assignments ----------
insert into case_assignment (case_id, officer_id, assigned_date, role) values
  ('CSE-05', 'OFF-04', '2026-05-14', 'lead'),
  ('CSE-05', 'OFF-10', '2026-05-15', 'support'),
  ('CSE-06', 'OFF-15', '2026-05-17', 'lead'),
  ('CSE-06', 'OFF-16', '2026-05-17', 'support'),
  ('CSE-06', 'OFF-09', '2026-05-18', 'liaison'),
  ('CSE-07', 'OFF-05', '2026-05-19', 'lead'),
  ('CSE-07', 'OFF-07', '2026-05-19', 'forensics'),
  ('CSE-08', 'OFF-03', '2026-05-23', 'lead'),
  ('CSE-08', 'OFF-02', '2026-05-24', 'support'),
  ('CSE-09', 'OFF-05', '2026-05-25', 'lead'),
  ('CSE-10', 'OFF-01', '2026-05-26', 'lead'),
  ('CSE-10', 'OFF-13', '2026-05-26', 'k9'),
  ('CSE-10', 'OFF-14', '2026-05-26', 'k9'),
  ('CSE-11', 'OFF-03', '2026-05-29', 'lead'),
  ('CSE-11', 'OFF-07', '2026-05-29', 'forensics'),
  ('CSE-12', 'OFF-02', '2026-05-18', 'lead'),
  ('CSE-12', 'OFF-07', '2026-05-19', 'forensics'),
  ('CSE-12', 'OFF-08', '2026-05-20', 'support')
on conflict do nothing;

-- ---------- More person involvements ----------
insert into person_involvement (case_id, person_id, role, notes) values
  ('CSE-05', 'PER-07', 'witness',  'Saw exchange from across the lot'),
  ('CSE-05', 'PER-17', 'suspect',  'Identified from prior narcotics record'),
  ('CSE-06', 'PER-08', 'witness',  'Reporting passenger'),
  ('CSE-06', 'PER-19', 'suspect',  'Owner of the suspicious package'),
  ('CSE-07', 'PER-09', 'victim',   'Homeowner; itemized stolen electronics'),
  ('CSE-07', 'PER-20', 'suspect',  'Prints match prior burglary case'),
  ('CSE-08', 'PER-10', 'victim',   'Sent funds via crypto to scammer'),
  ('CSE-08', 'PER-18', 'suspect',  'Traced through wallet address'),
  ('CSE-09', 'PER-11', 'witness',  'Shopkeeper; saw two suspects flee on bikes'),
  ('CSE-10', 'PER-14', 'victim',   '12-year-old taken from school perimeter'),
  ('CSE-10', 'PER-12', 'other',    'Mother / reporting party'),
  ('CSE-11', 'PER-13', 'victim',   'Received fake bills at gas station register'),
  ('CSE-12', 'PER-15', 'victim',   'Bar patron, multiple bruises and lacerations'),
  ('CSE-12', 'PER-17', 'suspect',  'Same suspect as CSE-05; known to victim')
on conflict do nothing;

-- ---------- More arrests ----------
insert into arrest (arrest_id, case_id, person_id, officer_id, arrested_at, location) values
  ('ARR-03', 'CSE-05', 'PER-17', 'OFF-04', '2026-05-15 14:00:00+00', 'Backstreet near 9th Ave'),
  ('ARR-04', 'CSE-06', 'PER-19', 'OFF-15', '2026-05-18 06:00:00+00', 'Airport terminal B, gate 14'),
  ('ARR-05', 'CSE-07', 'PER-20', 'OFF-05', '2026-05-20 18:00:00+00', '14 Maple Dr'),
  ('ARR-06', 'CSE-08', 'PER-18', 'OFF-03', '2026-05-24 11:00:00+00', 'Cafe Aroma, 3rd St'),
  ('ARR-07', 'CSE-12', 'PER-17', 'OFF-02', '2026-05-19 21:30:00+00', 'Outside Murphy''s Bar')
on conflict (arrest_id) do nothing;

-- ---------- More charges ----------
insert into charge (charge_id, arrest_id, crime_type_id, description, status) values
  ('CHG-04', 'ARR-03', 'CT-04', 'Possession with intent to distribute',      'filed'),
  ('CHG-05', 'ARR-04', 'CT-06', 'Attempted smuggling of controlled substances','pending'),
  ('CHG-06', 'ARR-05', 'CT-08', 'First-degree burglary',                      'filed'),
  ('CHG-07', 'ARR-06', 'CT-03', 'Wire fraud, $2,400 USD',                     'pending'),
  ('CHG-08', 'ARR-07', 'CT-02', 'Aggravated assault',                         'convicted'),
  ('CHG-09', 'ARR-07', 'CT-01', 'Petty theft (wallet taken in scuffle)',      'convicted')
on conflict (charge_id) do nothing;

-- ---------- More evidence ----------
insert into evidence (evidence_id, case_id, collected_by_officer_id, evidence_type, description, collected_at) values
  ('EVD-06', 'CSE-05', 'OFF-07', 'physical', 'Sealed bag of narcotics, ~250g',           '2026-05-15 15:00:00+00'),
  ('EVD-07', 'CSE-06', 'OFF-15', 'video',    'Airport security footage, terminal B',     '2026-05-18 07:00:00+00'),
  ('EVD-08', 'CSE-07', 'OFF-07', 'forensic', 'Latent fingerprints from window frame',    '2026-05-20 19:00:00+00'),
  ('EVD-09', 'CSE-08', 'OFF-03', 'document', 'Chat logs and crypto transaction history', '2026-05-24 12:00:00+00'),
  ('EVD-10', 'CSE-09', 'OFF-05', 'photo',    'Photos of smashed storefront and graffiti','2026-05-25 06:00:00+00')
on conflict (evidence_id) do nothing;
