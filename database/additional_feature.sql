-- 1. Alter the column in the table
ALTER TABLE userEducation
ALTER COLUMN grade VARCHAR(50) NULL;
GO

-----
ALTER tABle appUser
ADD cvfileName varchar(255) NULL;
GO

CREATE PROCEDURE sp_UpdatePersonalInfo
    @userId     BIGINT,
    @name       VARCHAR(100),
    @email      VARCHAR(150),
    @phone      VARCHAR(20)  = NULL,
    @age        INT          = NULL,
    @cvPath     VARCHAR(500) = NULL,
    @cvFileName VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status; RETURN;
    END

    IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
    BEGIN
        SELECT 'INVALID_NAME' AS Status; RETURN;
    END

    IF @email IS NULL OR LTRIM(RTRIM(@email)) = ''
    BEGIN
        SELECT 'INVALID_EMAIL' AS Status; RETURN;
    END

    IF EXISTS (SELECT 1 FROM appUser WHERE email = @email AND userId != @userId)
    BEGIN
        SELECT 'EMAIL_ALREADY_EXISTS' AS Status; RETURN;
    END

    UPDATE appUser
    SET name       = @name,
        email      = @email,
        phone      = @phone,
        age        = @age,
        cvPath     = ISNULL(@cvPath,     cvPath),      -- only update if provided
        cvFileName = ISNULL(@cvFileName, cvFileName)   -- only update if provided
    WHERE userId = @userId;

    SELECT
        userId, name, email, phone, age, cvPath, cvFileName,
        'SUCCESS' AS Status
    FROM appUser
    WHERE userId = @userId;
END;
GO

---------------------------------




CREATE PROCEDURE sp_AddEducation
    @userId        BIGINT,
    @instituteName VARCHAR(200),
    @level         VARCHAR(100),
    @degreeName    VARCHAR(150),
    @grade         VARCHAR(50)  = NULL,
    @startDate     DATE,
    @endDate       DATE         = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status, NULL AS eduId; RETURN;
    END

    IF @instituteName IS NULL OR LTRIM(RTRIM(@instituteName)) = ''
       OR @level IS NULL OR LTRIM(RTRIM(@level)) = ''
       OR @degreeName IS NULL OR LTRIM(RTRIM(@degreeName)) = ''
       OR @startDate IS NULL
    BEGIN
        SELECT 'MISSING_REQUIRED_FIELDS' AS Status, NULL AS eduId; RETURN;
    END

    INSERT INTO userEducation (userId, instituteName, level, degreeName, grade, startDate, endDate)
    VALUES (@userId, @instituteName, @level, @degreeName, @grade, @startDate, @endDate);

    DECLARE @newEduId BIGINT = SCOPE_IDENTITY();

    SELECT
        eduId, instituteName, level, degreeName, grade, startDate, endDate,
        'SUCCESS' AS Status
    FROM userEducation
    WHERE eduId = @newEduId;
END;
GO

CREATE PROCEDURE sp_UpdateEducation
    @eduId         BIGINT,
    @userId        BIGINT,
    @instituteName VARCHAR(200) = NULL,
    @level         VARCHAR(100) = NULL,
    @degreeName    VARCHAR(150) = NULL,
    @grade         VARCHAR(50)  = NULL,
    @startDate     DATE         = NULL,
    @endDate       DATE         = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userEducation WHERE eduId = @eduId AND userId = @userId)
    BEGIN
        SELECT 'EDUCATION_NOT_FOUND' AS Status; RETURN;
    END

    UPDATE userEducation
    SET
        instituteName = ISNULL(@instituteName, instituteName),
        level         = ISNULL(@level,         level),
        degreeName    = ISNULL(@degreeName,    degreeName),
        grade         = ISNULL(@grade,         grade),
        startDate     = ISNULL(@startDate,     startDate),
        endDate       = @endDate
    WHERE eduId = @eduId AND userId = @userId;

    SELECT
        eduId, instituteName, level, degreeName, grade, startDate, endDate,
        'SUCCESS' AS Status
    FROM userEducation
    WHERE eduId = @eduId;
END;
GO


-------------------------

CREATE PROCEDURE sp_DeleteEducation
    @eduId  BIGINT,
    @userId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userEducation WHERE eduId = @eduId AND userId = @userId)
    BEGIN
        SELECT 'EDUCATION_NOT_FOUND' AS Status; RETURN;
    END

    DELETE FROM userEducation WHERE eduId = @eduId AND userId = @userId;

    SELECT 'SUCCESS' AS Status;
END;
GO


---------------------------------------

CREATE PROCEDURE sp_AddExperience
    @userId      BIGINT,
    @companyName VARCHAR(200),
    @jobTitle    VARCHAR(150),
    @description VARCHAR(1000) = NULL,
    @startDate   DATE,
    @endDate     DATE          = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status, NULL AS expId; RETURN;
    END

    IF @companyName IS NULL OR LTRIM(RTRIM(@companyName)) = ''
       OR @jobTitle IS NULL OR LTRIM(RTRIM(@jobTitle)) = ''
       OR @startDate IS NULL
    BEGIN
        SELECT 'MISSING_REQUIRED_FIELDS' AS Status, NULL AS expId; RETURN;
    END

    INSERT INTO userExperience (userId, companyName, jobTitle, description, startDate, endDate)
    VALUES (@userId, @companyName, @jobTitle, @description, @startDate, @endDate);

    DECLARE @newExpId BIGINT = SCOPE_IDENTITY();

    SELECT
        expId, companyName, jobTitle, description, startDate, endDate,
        'SUCCESS' AS Status
    FROM userExperience
    WHERE expId = @newExpId;
END;
GO

CREATE PROCEDURE sp_UpdateExperience
    @expId       BIGINT,
    @userId      BIGINT,
    @companyName VARCHAR(200)  = NULL,
    @jobTitle    VARCHAR(150)  = NULL,
    @description VARCHAR(1000) = NULL,
    @startDate   DATE          = NULL,
    @endDate     DATE          = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userExperience WHERE expId = @expId AND userId = @userId)
    BEGIN
        SELECT 'EXPERIENCE_NOT_FOUND' AS Status; RETURN;
    END

    UPDATE userExperience
    SET
        companyName = ISNULL(@companyName, companyName),
        jobTitle    = ISNULL(@jobTitle,    jobTitle),
        description = ISNULL(@description, description),
        startDate   = ISNULL(@startDate,   startDate),
        endDate     = @endDate
    WHERE expId = @expId AND userId = @userId;

    SELECT
        expId, companyName, jobTitle, description, startDate, endDate,
        'SUCCESS' AS Status
    FROM userExperience
    WHERE expId = @expId;
END;
GO

--------------------------------
GO

CREATE PROCEDURE sp_DeleteExperience
    @expId  BIGINT,
    @userId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userExperience WHERE expId = @expId AND userId = @userId)
    BEGIN
        SELECT 'EXPERIENCE_NOT_FOUND' AS Status; RETURN;
    END

    DELETE FROM userExperience WHERE expId = @expId AND userId = @userId;

    SELECT 'SUCCESS' AS Status;
END;
GO

----------------------------------------------------


GO

CREATE PROCEDURE sp_AddUserSkill
    @userId      BIGINT,
    @skillName   VARCHAR(100),
    @category    VARCHAR(50)  = NULL,
    @proficiency VARCHAR(50)  = 'Beginner'
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status; RETURN;
    END

    IF @skillName IS NULL OR LTRIM(RTRIM(@skillName)) = ''
    BEGIN
        SELECT 'INVALID_SKILL_NAME' AS Status; RETURN;
    END

    -- Upsert into skill master table
    IF NOT EXISTS (SELECT 1 FROM skill WHERE skillName = @skillName)
        INSERT INTO skill (skillName, category) VALUES (@skillName, @category);

    DECLARE @skillId BIGINT = (SELECT skillId FROM skill WHERE skillName = @skillName);

    -- Prevent duplicate user skill
    IF EXISTS (SELECT 1 FROM userSkill WHERE userId = @userId AND skillId = @skillId)
    BEGIN
        SELECT 'SKILL_ALREADY_EXISTS' AS Status; RETURN;
    END

    INSERT INTO userSkill (userId, skillId, proficiency)
    VALUES (@userId, @skillId, @proficiency);

    SELECT
        us.userSkillId,
        s.skillName,
        s.category,
        us.proficiency,
        'SUCCESS' AS Status
    FROM userSkill us
    JOIN skill s ON s.skillId = us.skillId
    WHERE us.userId = @userId AND us.skillId = @skillId;
END;
GO






----------------------------------------


GO

CREATE PROCEDURE sp_UpdateUserSkill
    @userSkillId BIGINT,
    @userId      BIGINT,
    @proficiency VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userSkill WHERE userSkillId = @userSkillId AND userId = @userId)
    BEGIN
        SELECT 'SKILL_NOT_FOUND' AS Status; RETURN;
    END

    UPDATE userSkill
    SET proficiency = @proficiency
    WHERE userSkillId = @userSkillId AND userId = @userId;

    SELECT
        us.userSkillId,
        s.skillName,
        s.category,
        us.proficiency,
        'SUCCESS' AS Status
    FROM userSkill us
    JOIN skill s ON s.skillId = us.skillId
    WHERE us.userSkillId = @userSkillId;
END;
GO

------------------------------

GO

CREATE PROCEDURE sp_DeleteUserSkill
    @userSkillId BIGINT,
    @userId      BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userSkill WHERE userSkillId = @userSkillId AND userId = @userId)
    BEGIN
        SELECT 'SKILL_NOT_FOUND' AS Status; RETURN;
    END

    DELETE FROM userSkill WHERE userSkillId = @userSkillId AND userId = @userId;

    SELECT 'SUCCESS' AS Status;
END;
GO


--------------------------------------------



ALTER PROCEDURE GetUserProfile
    @UserId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Personal Info
    SELECT
        userId,
        name,
        email,
        phone,
        age,
        cvPath
    FROM appUser
    WHERE userId = @UserId;

    -- Education Info
    SELECT
        eduId,
        instituteName,
        level,
        degreeName,
        grade,
        startDate,
        endDate
    FROM userEducation
    WHERE userId = @UserId
    ORDER BY startDate DESC;

    -- Experience Info
    SELECT
        expId,
        companyName,
        jobTitle,
        description,
        startDate,
        endDate
    FROM userExperience
    WHERE userId = @UserId
    ORDER BY startDate DESC;

    -- Skills Info
    SELECT
        us.userSkillId,        -- ← added this
        s.skillId,
        s.skillName,
        s.category,
        us.proficiency
    FROM userSkill us
    INNER JOIN skill s ON us.skillId = s.skillId
    WHERE us.userId = @UserId
    ORDER BY s.category, s.skillName;

END;
GO


----------------------------


CREATE TRIGGER trg_ValidateEducationDates
ON userEducation
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE endDate IS NOT NULL AND startDate > endDate
    )
    BEGIN
        RAISERROR('Education startDate cannot be after endDate.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO




GO

CREATE TRIGGER trg_ValidateExperienceDates
ON userExperience
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE endDate IS NOT NULL AND startDate > endDate
    )
    BEGIN
        RAISERROR('Experience startDate cannot be after endDate.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO



GO

CREATE TRIGGER trg_CascadeDeleteUserProfile
ON appUser
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DELETE ue FROM userEducation ue
    INNER JOIN deleted d ON ue.userId = d.userId;

    DELETE ux FROM userExperience ux
    INNER JOIN deleted d ON ux.userId = d.userId;

    DELETE us FROM userSkill us
    INNER JOIN deleted d ON us.userId = d.userId;
END;
GO