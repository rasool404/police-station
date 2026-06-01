-- =========================================================
-- Replace the three generic demo accounts (citizen/officer/chef)
-- with named accounts tied to the real seeded officers and
-- complainants. Each officer in the database gets a login;
-- each citizen who has filed a complaint gets a login.
--
-- Username convention: firstname.lastname (apostrophes and
-- hyphens stripped). Password convention: firstname123.
-- =========================================================

-- Wipe the previous test accounts.
delete from user_account;

-- ---------- One chef (kept seeded so the bureau is bootable) ----------
insert into user_account (user_id, username, password, role, person_id, officer_id) values
    ('U-CHEF-01', 'chief', 'chief123', 'chef', null, null);

-- ---------- Officers (one per officer record) ----------
insert into user_account (user_id, username, password, role, person_id, officer_id) values
    ('U-OFF-01', 'alex.carter',    'alex123',    'officer', null, 'OFF-01'),
    ('U-OFF-02', 'maya.singh',     'maya123',    'officer', null, 'OFF-02'),
    ('U-OFF-03', 'jordan.lee',     'jordan123',  'officer', null, 'OFF-03'),
    ('U-OFF-04', 'priya.patel',    'priya123',   'officer', null, 'OFF-04'),
    ('U-OFF-05', 'sam.rivera',     'sam123',     'officer', null, 'OFF-05'),
    ('U-OFF-06', 'chen.wei',       'chen123',    'officer', null, 'OFF-06'),
    ('U-OFF-07', 'yuki.tanaka',    'yuki123',    'officer', null, 'OFF-07'),
    ('U-OFF-08', 'eli.mendez',     'eli123',     'officer', null, 'OFF-08'),
    ('U-OFF-09', 'aisha.yusuf',    'aisha123',   'officer', null, 'OFF-09'),
    ('U-OFF-10', 'diego.romero',   'diego123',   'officer', null, 'OFF-10'),
    ('U-OFF-11', 'olivia.park',    'olivia123',  'officer', null, 'OFF-11'),
    ('U-OFF-12', 'tomas.berg',     'tomas123',   'officer', null, 'OFF-12'),
    ('U-OFF-13', 'liam.obrien',    'liam123',    'officer', null, 'OFF-13'),
    ('U-OFF-14', 'sofia.romano',   'sofia123',   'officer', null, 'OFF-14'),
    ('U-OFF-15', 'rashid.alsayed', 'rashid123',  'officer', null, 'OFF-15'),
    ('U-OFF-16', 'anna.volkova',   'anna123',    'officer', null, 'OFF-16');

-- ---------- Citizens (one per person who has filed a complaint) ----------
insert into user_account (user_id, username, password, role, person_id, officer_id) values
    ('U-CIT-01', 'hassan.reza',   'hassan123',  'citizen', 'PER-01', null),
    ('U-CIT-02', 'nadia.khoury',  'nadia123',   'citizen', 'PER-02', null),
    ('U-CIT-04', 'lin.zhao',      'lin123',     'citizen', 'PER-04', null),
    ('U-CIT-05', 'ibrahim.conde', 'ibrahim123', 'citizen', 'PER-05', null),
    ('U-CIT-06', 'sara.okafor',   'sara123',    'citizen', 'PER-06', null),
    ('U-CIT-07', 'felix.mueller', 'felix123',   'citizen', 'PER-07', null),
    ('U-CIT-08', 'aisha.khan',    'aishak123',  'citizen', 'PER-08', null),
    ('U-CIT-09', 'diego.costa',   'diegoc123',  'citizen', 'PER-09', null),
    ('U-CIT-10', 'yuki.sato',     'yukis123',   'citizen', 'PER-10', null),
    ('U-CIT-11', 'oleg.petrov',   'oleg123',    'citizen', 'PER-11', null),
    ('U-CIT-12', 'amara.diallo',  'amara123',   'citizen', 'PER-12', null),
    ('U-CIT-13', 'karim.hassan',  'karim123',   'citizen', 'PER-13', null),
    ('U-CIT-14', 'mei.lin',       'mei123',     'citizen', 'PER-14', null),
    ('U-CIT-15', 'rafael.santos', 'rafael123',  'citizen', 'PER-15', null),
    ('U-CIT-16', 'zara.ahmed',    'zara123',    'citizen', 'PER-16', null);
