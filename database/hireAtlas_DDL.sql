CREATE DATABASE freshdb
GO

USE freshdb;

CREATE TABLE appUser
(
    userId   BIGINT        IDENTITY(1,1) PRIMARY KEY,
    name     VARCHAR(100)  NOT NULL,
    email    VARCHAR(150)  NOT NULL UNIQUE,
    phone    VARCHAR(20),
    age      INT           CHECK (age >= 15),
    password VARCHAR(255)  NOT NULL,
    cvPath   VARCHAR(255)
);

CREATE TABLE post
(
    postId          BIGINT        IDENTITY(1,1) PRIMARY KEY,
    creatorId       BIGINT        NOT NULL,
    companyName     VARCHAR(200),
    jobTitle        VARCHAR(150)  NOT NULL,
    description     VARCHAR(1000),
    location        VARCHAR(150),
    empType         VARCHAR(50)   CHECK (empType IN ('Full-Time', 'Part-Time', 'Contract', 'Freelance', 'Internship')),
    jobCategory     VARCHAR(100),
    experienceLevel VARCHAR(50)   CHECK (experienceLevel IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
    minSalary       DECIMAL(18,2) CHECK (minSalary >= 0),
    maxSalary       DECIMAL(18,2) CHECK (maxSalary >= 0),
    salCurrency     VARCHAR(10)   DEFAULT 'PKR',
    isRemote        BIT           NOT NULL DEFAULT 0,
    isActive        BIT           NOT NULL DEFAULT 1,
    postedDate      DATE          DEFAULT CAST(GETDATE() AS DATE),

    CONSTRAINT FK_post_appUser
        FOREIGN KEY (creatorId) REFERENCES appUser(userId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE application
(
    applicationId   BIGINT       IDENTITY(1,1) PRIMARY KEY,
    postId          BIGINT       NOT NULL,
    applicantId     BIGINT       NOT NULL,
    status          VARCHAR(50)  DEFAULT 'Pending'
                    CONSTRAINT CHK_application_status
                    CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
    applicationDate DATE         DEFAULT CAST(GETDATE() AS DATE),
    cvPath          VARCHAR(255),

    CONSTRAINT UQ_application
        UNIQUE (postId, applicantId),

    CONSTRAINT FK_application_post
        FOREIGN KEY (postId) REFERENCES post(postId)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_application_appUser
        FOREIGN KEY (applicantId) REFERENCES appUser(userId)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE userEducation
(
    eduId         BIGINT       IDENTITY(1,1) PRIMARY KEY,
    userId        BIGINT       NOT NULL,
    instituteName VARCHAR(200),
    level         VARCHAR(100),
    degreeName    VARCHAR(150),
    grade         DECIMAL(5,2),
    startDate     DATE,
    endDate       DATE,

    CONSTRAINT FK_userEducation_appUser
        FOREIGN KEY (userId) REFERENCES appUser(userId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE userExperience
(
    expId       BIGINT        IDENTITY(1,1) PRIMARY KEY,
    userId      BIGINT        NOT NULL,
    companyName VARCHAR(200),
    jobTitle    VARCHAR(150),
    description VARCHAR(1000),
    startDate   DATE,
    endDate     DATE,

    CONSTRAINT FK_userExperience_appUser
        FOREIGN KEY (userId) REFERENCES appUser(userId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE skill
(
    skillId   BIGINT       IDENTITY(1,1) PRIMARY KEY,
    skillName VARCHAR(100) NOT NULL UNIQUE,
    category  VARCHAR(100)
);

CREATE TABLE userSkill
(
    userSkillId BIGINT      IDENTITY(1,1) PRIMARY KEY,
    userId      BIGINT      NOT NULL,
    skillId     BIGINT      NOT NULL,
    proficiency VARCHAR(50) DEFAULT 'Beginner'
                CONSTRAINT CHK_userSkill_proficiency
                CHECK (proficiency IN ('Beginner', 'Intermediate', 'Expert')),

    CONSTRAINT UQ_userSkill
        UNIQUE (userId, skillId),

    CONSTRAINT FK_userSkill_appUser
        FOREIGN KEY (userId) REFERENCES appUser(userId)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_userSkill_skill
        FOREIGN KEY (skillId) REFERENCES skill(skillId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE postSkill
(
    postSkillId   BIGINT      IDENTITY(1,1) PRIMARY KEY,
    postId        BIGINT      NOT NULL,
    skillId       BIGINT      NOT NULL,
    requiredLevel VARCHAR(50) DEFAULT 'Beginner'
                  CONSTRAINT CHK_postSkill_requiredLevel
                  CHECK (requiredLevel IN ('Beginner', 'Intermediate', 'Expert')),

    CONSTRAINT UQ_postSkill
        UNIQUE (postId, skillId),

    CONSTRAINT FK_postSkill_post
        FOREIGN KEY (postId) REFERENCES post(postId)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_postSkill_skill
        FOREIGN KEY (skillId) REFERENCES skill(skillId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE postQualification
(
    qualId       BIGINT        IDENTITY(1,1) PRIMARY KEY,
    postId       BIGINT        NOT NULL,
    minDegree    VARCHAR(100),
    fieldOfStudy VARCHAR(150),
    minGrade     DECIMAL(5,2),

    CONSTRAINT FK_postQualification_post
        FOREIGN KEY (postId) REFERENCES post(postId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IX_appUser_Name          ON appUser (name);
CREATE INDEX IX_post_jobCategory      ON post (jobCategory);
CREATE INDEX IX_post_empType          ON post (empType);
CREATE INDEX IX_post_experienceLevel  ON post (experienceLevel);
CREATE INDEX IX_post_location         ON post (location);
CREATE INDEX IX_post_isActive         ON post (isActive);
CREATE INDEX IX_post_isRemote         ON post (isRemote);
CREATE INDEX IX_post_postedDate       ON post (postedDate);
CREATE INDEX IX_post_companyName      ON post (companyName);
CREATE INDEX IX_post_salary           ON post (minSalary, maxSalary);

CREATE INDEX IX_post_activeDate       ON post (isActive, postedDate);
CREATE INDEX IX_post_activeCategory   ON post (isActive, jobCategory);
CREATE INDEX IX_post_activeRemote     ON post (isActive, isRemote);

CREATE INDEX IX_application_postId      ON application (postId);
CREATE INDEX IX_application_applicantId ON application (applicantId);
CREATE INDEX IX_application_status      ON application (status);

CREATE INDEX IX_userSkill_userId    ON userSkill (userId);
CREATE INDEX IX_userSkill_skillId   ON userSkill (skillId);

CREATE INDEX IX_postSkill_postId    ON postSkill (postId);
CREATE INDEX IX_postSkill_skillId   ON postSkill (skillId);

CREATE INDEX IX_postQualification_postId ON postQualification (postId);

CREATE INDEX IX_userEducation_userId  ON userEducation (userId);
CREATE INDEX IX_userExperience_userId ON userExperience (userId);

CREATE INDEX IX_skill_skillName ON skill (skillName);
CREATE INDEX IX_skill_category  ON skill (category);



-------------------------------
ALTER tABle appUser
ADD cvFileName varchar(255) NULL;