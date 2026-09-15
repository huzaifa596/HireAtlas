-- HireAtlas PostgreSQL bootstrap
-- Run once against an empty database: psql -d hireatlas -f database/hireatlas_postgres.sql
-- This replaces the previous SQL Server scripts and is intentionally idempotent.

BEGIN;

CREATE TABLE IF NOT EXISTS appuser (
  userid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHECK (btrim(name) <> ''),
  email VARCHAR(150) NOT NULL UNIQUE CHECK (email = lower(email)),
  phone VARCHAR(20),
  age INTEGER CHECK (age IS NULL OR age >= 15),
  password VARCHAR(255) NOT NULL,
  cvpath VARCHAR(500),
  cvfilename VARCHAR(255),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  avatarpath VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS post (
  postid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creatorid BIGINT NOT NULL REFERENCES appuser(userid) ON DELETE CASCADE,
  companyname VARCHAR(200),
  jobtitle VARCHAR(150) NOT NULL CHECK (btrim(jobtitle) <> ''),
  description VARCHAR(1000), location VARCHAR(150),
  emptype VARCHAR(50) CHECK (emptype IN ('Full-Time','Part-Time','Contract','Freelance','Internship')),
  jobcategory VARCHAR(100),
  experiencelevel VARCHAR(50) CHECK (experiencelevel IN ('Entry','Mid','Senior','Lead','Executive')),
  minsalary NUMERIC(18,2) CHECK (minsalary IS NULL OR minsalary >= 0),
  maxsalary NUMERIC(18,2) CHECK (maxsalary IS NULL OR maxsalary >= 0),
  salcurrency VARCHAR(10) NOT NULL DEFAULT 'PKR',
  isremote BOOLEAN NOT NULL DEFAULT FALSE, isactive BOOLEAN NOT NULL DEFAULT TRUE,
  posteddate DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT post_salary_range CHECK (minsalary IS NULL OR maxsalary IS NULL OR minsalary <= maxsalary)
);

CREATE TABLE IF NOT EXISTS application (
  applicationid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  postid BIGINT NOT NULL REFERENCES post(postid) ON DELETE CASCADE,
  applicantid BIGINT NOT NULL REFERENCES appuser(userid) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Reviewed','Accepted','Rejected')),
  applicationdate DATE NOT NULL DEFAULT CURRENT_DATE, cvpath VARCHAR(500),
  UNIQUE (postid, applicantid)
);

CREATE TABLE IF NOT EXISTS usereducation (
  eduid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  userid BIGINT NOT NULL REFERENCES appuser(userid) ON DELETE CASCADE,
  institutename VARCHAR(200), level VARCHAR(100), degreename VARCHAR(150), grade VARCHAR(50),
  startdate DATE, enddate DATE,
  CONSTRAINT education_date_range CHECK (enddate IS NULL OR startdate IS NULL OR startdate <= enddate)
);

CREATE TABLE IF NOT EXISTS userexperience (
  expid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  userid BIGINT NOT NULL REFERENCES appuser(userid) ON DELETE CASCADE,
  companyname VARCHAR(200), jobtitle VARCHAR(150), description VARCHAR(1000), startdate DATE, enddate DATE,
  CONSTRAINT experience_date_range CHECK (enddate IS NULL OR startdate IS NULL OR startdate <= enddate)
);

CREATE TABLE IF NOT EXISTS skill (
  skillid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  skillname VARCHAR(100) NOT NULL UNIQUE, category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS userskill (
  userskillid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  userid BIGINT NOT NULL REFERENCES appuser(userid) ON DELETE CASCADE,
  skillid BIGINT NOT NULL REFERENCES skill(skillid) ON DELETE CASCADE,
  proficiency VARCHAR(50) NOT NULL DEFAULT 'Beginner' CHECK (proficiency IN ('Beginner','Intermediate','Expert')),
  UNIQUE (userid, skillid)
);

CREATE TABLE IF NOT EXISTS postskill (
  postskillid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  postid BIGINT NOT NULL REFERENCES post(postid) ON DELETE CASCADE,
  skillid BIGINT NOT NULL REFERENCES skill(skillid) ON DELETE CASCADE,
  requiredlevel VARCHAR(50) NOT NULL DEFAULT 'Beginner' CHECK (requiredlevel IN ('Beginner','Intermediate','Expert')),
  UNIQUE (postid, skillid)
);

CREATE TABLE IF NOT EXISTS postqualification (
  qualid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  postid BIGINT NOT NULL REFERENCES post(postid) ON DELETE CASCADE,
  mindegree VARCHAR(100), fieldofstudy VARCHAR(150), mingrade NUMERIC(5,2)
);

-- Indexes support the dashboard, filter panel, profiles, and application views.
CREATE INDEX IF NOT EXISTS idx_post_active_date ON post (posteddate DESC) WHERE isactive;
CREATE INDEX IF NOT EXISTS idx_post_filter ON post (jobcategory, emptype, experiencelevel) WHERE isactive;
CREATE INDEX IF NOT EXISTS idx_post_location_lower ON post (lower(location)) WHERE isactive;
CREATE INDEX IF NOT EXISTS idx_application_applicant ON application (applicantid, applicationdate DESC);
CREATE INDEX IF NOT EXISTS idx_application_post ON application (postid, applicationdate);
CREATE INDEX IF NOT EXISTS idx_education_user ON usereducation (userid, startdate DESC);
CREATE INDEX IF NOT EXISTS idx_experience_user ON userexperience (userid, startdate DESC);
CREATE INDEX IF NOT EXISTS idx_userskill_user ON userskill (userid);

-- Final application decisions must not be changed after acceptance/rejection.
CREATE OR REPLACE FUNCTION prevent_final_application_status_change() RETURNS trigger AS $$
BEGIN
  IF OLD.status IN ('Accepted','Rejected') AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Final decisions (Accepted/Rejected) cannot be modified.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_status_is_final ON application;
CREATE TRIGGER application_status_is_final BEFORE UPDATE OF status ON application
FOR EACH ROW EXECUTE FUNCTION prevent_final_application_status_change();

COMMIT;
