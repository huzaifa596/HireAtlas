CREATE PROCEDURE sp_AddExperience
    @userId BIGINT,
    @companyName VARCHAR(200),
    @jobTitle VARCHAR(150),
    @description VARCHAR(1000) =NULL,
    @startDate DATE,
    @endDate DATE = NULL
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
    @expId BIGINT,
    @userId BIGINT,
    @companyName VARCHAR(200) =NULL,
    @jobTitle VARCHAR(150)  = NULL,
    @description VARCHAR(1000) = NULL,
    @startDate DATE  = NULL,
    @endDate DATE = NULL
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
        jobTitle = ISNULL(@jobTitle,    jobTitle),
        description = ISNULL(@description, description),
        startDate = ISNULL(@startDate,   startDate),
        endDate = @endDate
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

