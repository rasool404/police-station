-- =========================================================
-- Replace jargon in the seeded mock data with plain words.
-- Idempotent: every update is keyed by the row ID, so
-- re-running just keeps the values the same.
-- =========================================================

-- Crime types
update crime_type set name = 'Theft'             where crime_type_id = 'CT-01';
update crime_type set name = 'Attack'            where crime_type_id = 'CT-02';
update crime_type set name = 'Scam'              where crime_type_id = 'CT-03';
update crime_type set name = 'Drug Possession'   where crime_type_id = 'CT-04';
update crime_type set name = 'Murder'            where crime_type_id = 'CT-05';
update crime_type set name = 'Smuggling'         where crime_type_id = 'CT-06';
update crime_type set name = 'Property Damage'   where crime_type_id = 'CT-07';
update crime_type set name = 'Break-in'          where crime_type_id = 'CT-08';
update crime_type set name = 'Kidnapping'        where crime_type_id = 'CT-09';
update crime_type set name = 'Fake Money'        where crime_type_id = 'CT-10';

-- Departments
update department set name = 'Murder Investigations', description = 'Looks into murders and suspicious deaths' where department_id = 'DEP-01';
update department set name = 'Online Crime',          description = 'Online fraud and computer crime'         where department_id = 'DEP-02';
update department set name = 'Drugs Unit',            description = 'Drug-related cases'                       where department_id = 'DEP-03';
update department set name = 'Traffic',               description = 'Road incidents and car-related offences'  where department_id = 'DEP-04';
update department set name = 'Smuggling',             description = 'Port and dock smuggling cases'            where department_id = 'DEP-05';
update department set name = 'Lab',                   description = 'Crime-scene analysis'                     where department_id = 'DEP-06';
update department set name = 'Anti-Terror',           description = 'Counter-terrorism work'                   where department_id = 'DEP-07';
update department set name = 'Officer Conduct',       description = 'Investigates officer misconduct'          where department_id = 'DEP-08';
update department set name = 'Police Dogs',           description = 'Tracker dog teams'                        where department_id = 'DEP-09';
update department set name = 'Airport Security',      description = 'Airport patrols and screening'            where department_id = 'DEP-10';

-- Complaint descriptions / titles
update complaint set description = 'Person from a dating app got $2,400 out of me'
  where complaint_id = 'CMP-09';
update complaint set title = 'Got fake $100 bills as change',
                     description = 'Got fake $100 bills as change at a petrol station'
  where complaint_id = 'CMP-12';
update complaint set description = 'Anonymous mean messages on social media'
  where complaint_id = 'CMP-15';

-- Charges (descriptions are free text)
update charge set description = 'Wallet theft'                            where charge_id = 'CHG-01';
update charge set description = 'Murder'                                  where charge_id = 'CHG-02';
update charge set description = 'Serious attack (related)'                where charge_id = 'CHG-03';
update charge set description = 'Drug dealing'                            where charge_id = 'CHG-04';
update charge set description = 'Trying to smuggle drugs'                 where charge_id = 'CHG-05';
update charge set description = 'Breaking into a house'                   where charge_id = 'CHG-06';
update charge set description = 'Online scam, $2,400'                     where charge_id = 'CHG-07';
update charge set description = 'Serious attack'                          where charge_id = 'CHG-08';
update charge set description = 'Wallet stolen in fight'                  where charge_id = 'CHG-09';

-- Person involvement notes that were a bit jargony
update person_involvement set notes = 'Has a drug-related record'
  where case_id = 'CSE-05' and person_id = 'PER-17' and role = 'suspect';
update person_involvement set notes = 'Owner of the package'
  where case_id = 'CSE-06' and person_id = 'PER-19' and role = 'suspect';
update person_involvement set notes = 'House owner; listed what was stolen'
  where case_id = 'CSE-07' and person_id = 'PER-09' and role = 'victim';
update person_involvement set notes = 'Fingerprints match earlier break-in case'
  where case_id = 'CSE-07' and person_id = 'PER-20' and role = 'suspect';
update person_involvement set notes = 'Tracked through the money trail'
  where case_id = 'CSE-08' and person_id = 'PER-18' and role = 'suspect';
update person_involvement set notes = 'Shop owner; saw two people run on bikes'
  where case_id = 'CSE-09' and person_id = 'PER-11' and role = 'witness';
update person_involvement set notes = '12-year-old taken from outside school'
  where case_id = 'CSE-10' and person_id = 'PER-14' and role = 'victim';
update person_involvement set notes = 'Mother; the one who reported it'
  where case_id = 'CSE-10' and person_id = 'PER-12' and role = 'other';
update person_involvement set notes = 'Got fake bills at a petrol station'
  where case_id = 'CSE-11' and person_id = 'PER-13' and role = 'victim';
update person_involvement set notes = 'Bar customer, bruised and cut'
  where case_id = 'CSE-12' and person_id = 'PER-15' and role = 'victim';
update person_involvement set notes = 'Same person as CSE-05; victim knew them'
  where case_id = 'CSE-12' and person_id = 'PER-17' and role = 'suspect';

-- case_assignment roles (free text)
update case_assignment set role = 'lab'         where role = 'forensics';
update case_assignment set role = 'coordinator' where role = 'liaison';
update case_assignment set role = 'dog handler' where role = 'k9';

-- Evidence types (free text)
update evidence set evidence_type = 'lab' where evidence_type = 'forensic';
