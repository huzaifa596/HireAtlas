-- 1. Alter the column in the table
ALTER TABLE userEducation
ALTER COLUMN grade VARCHAR(50) NULL;
GO

-----
CREATE PROCEDURE sp_UpdatePersonalInfo
    @userId BIGINT,
    @name   VARCHAR(100),
    @email  VARCHAR(150),
    @phone  VARCHAR(20)  = NULL,
    @age    INT          = NULL
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

    -- Check email not taken by someone else
    IF EXISTS (SELECT 1 FROM appUser WHERE email = @email AND userId != @userId)
    BEGIN
        SELECT 'EMAIL_ALREADY_EXISTS' AS Status; RETURN;
    END

    UPDATE appUser
    SET name  = @name,
        email = @email,
        phone = @phone,
        age   = @age
    WHERE userId = @userId;

    SELECT
        userId, name, email, phone, age,
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
