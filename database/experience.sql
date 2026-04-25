
-- ================================================================================================
-- USER EXPERIENCE: INSERT
-- ================================================================================================
CREATE PROCEDURE insertExperience
    @userId      BIGINT,
    @companyName VARCHAR(200),
    @jobTitle    VARCHAR(150),
    @description VARCHAR(1000),
    @startDate   DATE,
    @endDate     DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        RAISERROR('User does not exist.', 16, 1);
        RETURN;
    END

    IF @endDate IS NOT NULL AND @endDate < @startDate
    BEGIN
        RAISERROR('INVALID DATE: End date cannot be before start date.', 16, 1);
        RETURN;
    END

    INSERT INTO userExperience (userId, companyName, jobTitle, description, startDate, endDate)
    VALUES (@userId, @companyName, @jobTitle, @description, @startDate, @endDate);
END;
GO

-- ================================================================================================
-- USER EXPERIENCE: GET
-- ================================================================================================
CREATE PROCEDURE getUserExperience
    @userId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        RAISERROR('User does not exist.', 16, 1);
        RETURN;
    END

    SELECT
        expId,
        companyName,
        jobTitle,
        description,
        startDate,
        endDate
    FROM userExperience
    WHERE userId = @userId
    ORDER BY startDate DESC;
END;
GO

-- ================================================================================================
-- USER EXPERIENCE: REMOVE
-- ================================================================================================
CREATE PROCEDURE removeExperience
    @userId BIGINT,
    @expId  BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM userExperience
        WHERE expId  = @expId
          AND userId = @userId
    )
    BEGIN
        RAISERROR('Experience record not found.', 16, 1);
        RETURN;
    END

    DELETE FROM userExperience
    WHERE expId  = @expId
      AND userId = @userId;
END;
GO