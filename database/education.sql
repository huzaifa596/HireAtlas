
-- ================================================================================================
-- INSERT EDUCATION PROCEDURE
-- ================================================================================================
CREATE PROCEDURE insertEducation
    @userId        BIGINT,
    @instituteName VARCHAR(200),
    @level         VARCHAR(100),
    @degreeName    VARCHAR(150),
    @grade         DECIMAL(5,2),
    @startDate     DATE,
    @endDate       DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        RAISERROR('User does not exist.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1 FROM userEducation
        WHERE userId       = @userId
          AND degreeName   = @degreeName
          AND instituteName = @instituteName
    )
    BEGIN
        RAISERROR('Duplicate education record.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        INSERT INTO userEducation (userId, instituteName, level, degreeName, grade, startDate, endDate)
        VALUES (@userId, @instituteName, @level, @degreeName, @grade, @startDate, @endDate);
    END TRY
    BEGIN CATCH
        DECLARE @Err NVARCHAR(MAX) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END;
GO

-- ================================================================================================
-- UPDATE EDUCATION START DATE
-- FIX: Added @eduId parameter so only the specific record is updated, not all records for the user
-- ================================================================================================
CREATE PROCEDURE UpdateEducationStartDate
    @userId    BIGINT,
    @eduId     BIGINT,
    @startDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userEducation WHERE eduId = @eduId AND userId = @userId)
    BEGIN
        RAISERROR('Education record not found.', 16, 1);
        RETURN;
    END

    IF @startDate > CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR('INVALID DATE: Start date cannot be in the future.', 16, 1);
        RETURN;
    END

    UPDATE userEducation
    SET startDate = @startDate
    WHERE eduId  = @eduId
      AND userId = @userId;
END;
GO

-- ================================================================================================
-- UPDATE EDUCATION END DATE
-- FIX: Added @eduId parameter so only the specific record is updated, not all records for the user
-- ================================================================================================
CREATE PROCEDURE UpdateEducationEndDate
    @userId  BIGINT,
    @eduId   BIGINT,
    @endDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @existingStartDate DATE;

    SELECT @existingStartDate = startDate
    FROM userEducation
    WHERE eduId  = @eduId
      AND userId = @userId;

    IF @existingStartDate IS NULL
    BEGIN
        RAISERROR('Education record not found.', 16, 1);
        RETURN;
    END

    IF @endDate > CAST(GETDATE() AS DATE) OR @endDate < @existingStartDate
    BEGIN
        RAISERROR('INVALID DATE: End date is in the future or before start date.', 16, 1);
        RETURN;
    END

    UPDATE userEducation
    SET endDate = @endDate
    WHERE eduId  = @eduId
      AND userId = @userId;
END;
GO

-- ================================================================================================
-- GET USER EDUCATION
-- ================================================================================================
CREATE PROCEDURE getUserEducation
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
        eduId,
        instituteName,
        level,
        degreeName,
        grade,
        startDate,
        endDate
    FROM userEducation
    WHERE userId = @userId
    ORDER BY startDate DESC;
END;
GO

-- ================================================================================================
-- REMOVE EDUCATION
-- ================================================================================================
CREATE PROCEDURE removeEducation
    @userId     BIGINT,
    @degreeName VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM userEducation
        WHERE userId    = @userId
          AND degreeName = @degreeName
    )
    BEGIN
        RAISERROR('Education record not found.', 16, 1);
        RETURN;
    END

    DELETE FROM userEducation
    WHERE userId    = @userId
      AND degreeName = @degreeName;
END;
GO
