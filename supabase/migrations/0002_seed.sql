-- =========================================================
-- Sample data so the admin UI isn't empty.
-- Idempotent: re-running won't error thanks to ON CONFLICT.
-- =========================================================

-- Stations
insert into police_station (station_id, name, address, phone) values
  ('STN-01', 'Central Precinct', '12 Main St',     '+1-555-0001'),
  ('STN-02', 'North District',  '88 North Ave',    '+1-555-0002'),
  ('STN-03', 'Harbor Station',  '5 Dockside Rd',   '+1-555-0003')
on conflict (station_id) do nothing;

-- Departments
insert into department (department_id, station_id, name, description) values
  ('DEP-01', 'STN-01', 'Homicide',       'Investigates murders and suspicious deaths'),
  ('DEP-02', 'STN-01', 'Cybercrime',     'Digital fraud and online offenses'),
  ('DEP-03', 'STN-02', 'Narcotics',      'Drug-related investigations'),
  ('DEP-04', 'STN-02', 'Traffic',        'Road incidents and vehicular offenses'),
  ('DEP-05', 'STN-03', 'Smuggling',      'Port and waterway smuggling cases')
on conflict (department_id) do nothing;

-- Ranks
insert into rank (rank_id, title, level) values
  ('R1', 'Cadet',      1),
  ('R2', 'Officer',    2),
  ('R3', 'Sergeant',   3),
  ('R4', 'Lieutenant', 4),
  ('R5', 'Captain',    5)
on conflict (rank_id) do nothing;

-- Officers
insert into officer (officer_id, station_id, department_id, rank_id, badge_number, name, phone, join_date) values
  ('OFF-01', 'STN-01', 'DEP-01', 'R4', 'B-1001', 'Alex Carter',    '+1-555-1001', '2018-06-12'),
  ('OFF-02', 'STN-01', 'DEP-01', 'R2', 'B-1002', 'Maya Singh',     '+1-555-1002', '2021-03-04'),
  ('OFF-03', 'STN-01', 'DEP-02', 'R3', 'B-1003', 'Jordan Lee',     '+1-555-1003', '2019-11-22'),
  ('OFF-04', 'STN-02', 'DEP-03', 'R5', 'B-2001', 'Priya Patel',    '+1-555-2001', '2010-01-15'),
  ('OFF-05', 'STN-02', 'DEP-04', 'R2', 'B-2002', 'Sam Rivera',     '+1-555-2002', '2022-08-30'),
  ('OFF-06', 'STN-03', 'DEP-05', 'R3', 'B-3001', 'Chen Wei',       '+1-555-3001', '2017-05-09')
on conflict (officer_id) do nothing;

-- Persons (victims, suspects, complainants)
insert into person (person_id, name, national_id, address, phone, dob, gender) values
  ('PER-01', 'Hassan Reza',     'NID-1001', '22 Elm St',     '+1-555-7001', '1985-02-14', 'M'),
  ('PER-02', 'Nadia Khoury',    'NID-1002', '4 Oak Ave',     '+1-555-7002', '1990-09-30', 'F'),
  ('PER-03', 'Marco Bianchi',   'NID-1003', '11 Pine Blvd',  '+1-555-7003', '1978-12-01', 'M'),
  ('PER-04', 'Lin Zhao',        'NID-1004', '7 Willow Ln',   '+1-555-7004', '1995-07-19', 'F'),
  ('PER-05', 'Ibrahim Conde',   'NID-1005', '99 Cedar Way',  '+1-555-7005', '1982-04-04', 'M'),
  ('PER-06', 'Sara Okafor',     'NID-1006', '3 Birch Sq',    '+1-555-7006', '2000-11-11', 'F')
on conflict (person_id) do nothing;

-- Crime types
insert into crime_type (crime_type_id, name, severity, description) values
  ('CT-01', 'Theft',         'medium',  'Unlawful taking of property'),
  ('CT-02', 'Assault',       'high',    'Physical attack on a person'),
  ('CT-03', 'Fraud',         'medium',  'Deception for financial gain'),
  ('CT-04', 'Drug Possession','high',   'Possession of controlled substances'),
  ('CT-05', 'Homicide',      'critical','Unlawful killing of a person'),
  ('CT-06', 'Smuggling',     'high',    'Illegal import/export of goods')
on conflict (crime_type_id) do nothing;

-- Complaints
insert into complaint (complaint_id, complainant_id, officer_id, filed_at, description, status) values
  ('CMP-01', 'PER-01', 'OFF-02', '2026-04-12 09:15:00+00', 'Wallet stolen from coffee shop',          'converted'),
  ('CMP-02', 'PER-02', 'OFF-03', '2026-04-18 14:00:00+00', 'Suspicious online charges on bank card',  'converted'),
  ('CMP-03', 'PER-04', 'OFF-05', '2026-05-02 22:30:00+00', 'Hit and run incident on Highway 7',       'under_review'),
  ('CMP-04', 'PER-05', 'OFF-06', '2026-05-10 06:45:00+00', 'Suspicious crates unloaded at dock 4',    'converted'),
  ('CMP-05', 'PER-06', 'OFF-01', '2026-05-20 11:00:00+00', 'Body found in alley behind 5th street',   'converted')
on conflict (complaint_id) do nothing;

-- Cases (one per converted complaint)
insert into "case" (case_id, complaint_id, crime_type_id, lead_officer_id, opened_date, closed_date, status) values
  ('CSE-01', 'CMP-01', 'CT-01', 'OFF-02', '2026-04-13', null,          'investigating'),
  ('CSE-02', 'CMP-02', 'CT-03', 'OFF-03', '2026-04-19', null,          'investigating'),
  ('CSE-03', 'CMP-04', 'CT-06', 'OFF-06', '2026-05-11', null,          'open'),
  ('CSE-04', 'CMP-05', 'CT-05', 'OFF-01', '2026-05-21', null,          'investigating')
on conflict (case_id) do nothing;

-- Case assignments (officers working each case)
insert into case_assignment (case_id, officer_id, assigned_date, role) values
  ('CSE-01', 'OFF-02', '2026-04-13', 'lead'),
  ('CSE-02', 'OFF-03', '2026-04-19', 'lead'),
  ('CSE-02', 'OFF-02', '2026-04-20', 'support'),
  ('CSE-03', 'OFF-06', '2026-05-11', 'lead'),
  ('CSE-04', 'OFF-01', '2026-05-21', 'lead'),
  ('CSE-04', 'OFF-02', '2026-05-22', 'forensics')
on conflict do nothing;

-- People involved in cases
insert into person_involvement (case_id, person_id, role, notes) values
  ('CSE-01', 'PER-01', 'victim',  'Reporting party, wallet stolen'),
  ('CSE-01', 'PER-03', 'suspect', 'Seen on CCTV near scene'),
  ('CSE-02', 'PER-02', 'victim',  'Bank card holder'),
  ('CSE-03', 'PER-05', 'witness', 'Saw crates being unloaded'),
  ('CSE-04', 'PER-06', 'witness', 'Found the body'),
  ('CSE-04', 'PER-03', 'suspect', 'Person of interest, prior record')
on conflict do nothing;

-- Arrests
insert into arrest (arrest_id, case_id, person_id, officer_id, arrested_at, location) values
  ('ARR-01', 'CSE-01', 'PER-03', 'OFF-02', '2026-04-20 17:30:00+00', '11 Pine Blvd'),
  ('ARR-02', 'CSE-04', 'PER-03', 'OFF-01', '2026-05-23 08:00:00+00', 'Central Park north gate')
on conflict (arrest_id) do nothing;

-- Charges resulting from arrests
insert into charge (charge_id, arrest_id, crime_type_id, description, status) values
  ('CHG-01', 'ARR-01', 'CT-01', 'Petty theft of wallet',           'filed'),
  ('CHG-02', 'ARR-02', 'CT-05', 'Suspicion of first-degree murder', 'pending'),
  ('CHG-03', 'ARR-02', 'CT-02', 'Aggravated assault (related)',     'pending')
on conflict (charge_id) do nothing;

-- Evidence
insert into evidence (evidence_id, case_id, collected_by_officer_id, evidence_type, description, collected_at) values
  ('EVD-01', 'CSE-01', 'OFF-02', 'video',     'CCTV footage from coffee shop',      '2026-04-13 10:00:00+00'),
  ('EVD-02', 'CSE-02', 'OFF-03', 'document',  'Bank transaction logs',              '2026-04-19 16:00:00+00'),
  ('EVD-03', 'CSE-03', 'OFF-06', 'photo',     'Photos of crates and dock area',     '2026-05-11 07:30:00+00'),
  ('EVD-04', 'CSE-04', 'OFF-02', 'physical',  'Recovered weapon, bagged and tagged','2026-05-22 13:15:00+00'),
  ('EVD-05', 'CSE-04', 'OFF-01', 'forensic',  'DNA swab from scene',                '2026-05-21 20:00:00+00')
on conflict (evidence_id) do nothing;
