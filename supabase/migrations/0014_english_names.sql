-- =========================================================
-- Rename every officer and person to a plain English name so
-- the demo reads cleanly to an English-speaking audience.
-- Usernames + passwords are re-set to match the new names
-- (pattern: firstname.lastname / firstname123).
-- =========================================================

-- ---------- Officers ----------
update officer set name = 'Alex Carter'     where officer_id = 'OFF-01';
update officer set name = 'Maya Brooks'     where officer_id = 'OFF-02';
update officer set name = 'Jordan Lee'      where officer_id = 'OFF-03';
update officer set name = 'Patricia Hayes'  where officer_id = 'OFF-04';
update officer set name = 'Sam Reynolds'    where officer_id = 'OFF-05';
update officer set name = 'Charles Webb'    where officer_id = 'OFF-06';
update officer set name = 'Yvonne Turner'   where officer_id = 'OFF-07';
update officer set name = 'Elliot Morgan'   where officer_id = 'OFF-08';
update officer set name = 'Alice Young'     where officer_id = 'OFF-09';
update officer set name = 'David Reed'      where officer_id = 'OFF-10';
update officer set name = 'Olivia Powell'   where officer_id = 'OFF-11';
update officer set name = 'Thomas Bell'     where officer_id = 'OFF-12';
update officer set name = 'Liam Brennan'    where officer_id = 'OFF-13';
update officer set name = 'Sophie Ross'     where officer_id = 'OFF-14';
update officer set name = 'Robert Sands'    where officer_id = 'OFF-15';
update officer set name = 'Anna Walker'     where officer_id = 'OFF-16';

-- ---------- Persons ----------
update person set name = 'Henry Roberts'    where person_id = 'PER-01';
update person set name = 'Nancy King'       where person_id = 'PER-02';
update person set name = 'Mark Bishop'      where person_id = 'PER-03';
update person set name = 'Linda Zane'       where person_id = 'PER-04';
update person set name = 'Ian Cooper'       where person_id = 'PER-05';
update person set name = 'Sarah Oakley'     where person_id = 'PER-06';
update person set name = 'Felix Murray'     where person_id = 'PER-07';
update person set name = 'Amy Knight'       where person_id = 'PER-08';
update person set name = 'Daniel Cole'      where person_id = 'PER-09';
update person set name = 'Yvette Stone'     where person_id = 'PER-10';
update person set name = 'Oliver Page'      where person_id = 'PER-11';
update person set name = 'Abigail Davis'    where person_id = 'PER-12';
update person set name = 'Kevin Hall'       where person_id = 'PER-13';
update person set name = 'May Lincoln'      where person_id = 'PER-14';
update person set name = 'Ryan Sanders'     where person_id = 'PER-15';
update person set name = 'Zoe Adams'        where person_id = 'PER-16';
update person set name = 'Victor Nelson'    where person_id = 'PER-17';
update person set name = 'Laura Mills'      where person_id = 'PER-18';
update person set name = 'Brian Norton'     where person_id = 'PER-19';
update person set name = 'Iris Jackson'     where person_id = 'PER-20';

-- ---------- User accounts (officers) ----------
update user_account set username = 'alex.carter',    password = 'alex123'    where user_id = 'U-OFF-01';
update user_account set username = 'maya.brooks',    password = 'maya123'    where user_id = 'U-OFF-02';
update user_account set username = 'jordan.lee',     password = 'jordan123'  where user_id = 'U-OFF-03';
update user_account set username = 'patricia.hayes', password = 'patricia123' where user_id = 'U-OFF-04';
update user_account set username = 'sam.reynolds',   password = 'sam123'     where user_id = 'U-OFF-05';
update user_account set username = 'charles.webb',   password = 'charles123' where user_id = 'U-OFF-06';
update user_account set username = 'yvonne.turner',  password = 'yvonne123'  where user_id = 'U-OFF-07';
update user_account set username = 'elliot.morgan',  password = 'elliot123'  where user_id = 'U-OFF-08';
update user_account set username = 'alice.young',    password = 'alice123'   where user_id = 'U-OFF-09';
update user_account set username = 'david.reed',     password = 'david123'   where user_id = 'U-OFF-10';
update user_account set username = 'olivia.powell',  password = 'olivia123'  where user_id = 'U-OFF-11';
update user_account set username = 'thomas.bell',    password = 'thomas123'  where user_id = 'U-OFF-12';
update user_account set username = 'liam.brennan',   password = 'liam123'    where user_id = 'U-OFF-13';
update user_account set username = 'sophie.ross',    password = 'sophie123'  where user_id = 'U-OFF-14';
update user_account set username = 'robert.sands',   password = 'robert123'  where user_id = 'U-OFF-15';
update user_account set username = 'anna.walker',    password = 'anna123'    where user_id = 'U-OFF-16';

-- ---------- User accounts (citizens, only those who filed complaints) ----------
update user_account set username = 'henry.roberts',  password = 'henry123'   where user_id = 'U-CIT-01';
update user_account set username = 'nancy.king',     password = 'nancy123'   where user_id = 'U-CIT-02';
update user_account set username = 'linda.zane',     password = 'linda123'   where user_id = 'U-CIT-04';
update user_account set username = 'ian.cooper',     password = 'ian123'     where user_id = 'U-CIT-05';
update user_account set username = 'sarah.oakley',   password = 'sarah123'   where user_id = 'U-CIT-06';
update user_account set username = 'felix.murray',   password = 'felix123'   where user_id = 'U-CIT-07';
update user_account set username = 'amy.knight',     password = 'amy123'     where user_id = 'U-CIT-08';
update user_account set username = 'daniel.cole',    password = 'daniel123'  where user_id = 'U-CIT-09';
update user_account set username = 'yvette.stone',   password = 'yvette123'  where user_id = 'U-CIT-10';
update user_account set username = 'oliver.page',    password = 'oliver123'  where user_id = 'U-CIT-11';
update user_account set username = 'abigail.davis',  password = 'abigail123' where user_id = 'U-CIT-12';
update user_account set username = 'kevin.hall',     password = 'kevin123'   where user_id = 'U-CIT-13';
update user_account set username = 'may.lincoln',    password = 'may123'     where user_id = 'U-CIT-14';
update user_account set username = 'ryan.sanders',   password = 'ryan123'    where user_id = 'U-CIT-15';
update user_account set username = 'zoe.adams',      password = 'zoe123'     where user_id = 'U-CIT-16';
