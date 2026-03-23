USE hireatlas 
GO
--====================================================================
CREATE PROCEDURE UpdateEducationStartDate
    @userId    BIGINT,
    @startDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF @startDate > CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR('INVALID DATE: Start date cannot be in the future.', 16, 1);
        RETURN;
    END

    UPDATE userEducation
    SET startDate = @startDate
    WHERE userId = @userId;
END;
--====================================================================

CREATE PROCEDURE UpdateEducationEndDate
    @userId  BIGINT,
    @endDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @existingStartDate DATE;

    SELECT @existingStartDate = startDate 
    FROM userEducation 
    WHERE userId = @userId;

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
    WHERE userId = @userId;
END;

--====================================================================
CREATE PROCEDURE insertEducation  
    @userId         BIGINT,
    @instituteName  VARCHAR(200),
    @level          VARCHAR(100),
    @degreeName     VARCHAR(150),
    @grade          DECIMAL(5,2),
    @startDate      DATE,
    @endDate        DATE
AS
BEGIN
    SET NOCOUNT ON;
    --turns the 1 row affected message off
    IF EXISTS (SELECT 1 FROM userEducation 
               WHERE userId = @userId 
               AND degreeName = @degreeName 
               AND instituteName = @instituteName)
    BEGIN
        RAISERROR('Duplicate education record.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        INSERT INTO userEducation (
            userId, 
            instituteName, 
            level, 
            degreeName, 
            grade, 
            startDate, 
            endDate
        )
        VALUES (
            @userId, 
            @instituteName, 
            @level, 
            @degreeName, 
            @grade, 
            @startDate, 
            @endDate
        );
    END TRY
    BEGIN CATCH
        DECLARE @Err NVARCHAR(MAX) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END;

--===============================================================

CREATE TRIGGER tr_RestrictStatusFlow
ON application
AFTER UPDATE
AS
BEGIN
    IF UPDATE(status)
    BEGIN
        IF EXISTS (
            SELECT 1 
            FROM deleted d
            JOIN inserted i ON d.applicationId = i.applicationId
            WHERE d.status IN ('Rejected', 'Accepted')
        )
        BEGIN
            RAISERROR ('Final decisions (Accepted/Rejected) cannot be modified.', 16, 1);
            ROLLBACK TRANSACTION;
        END
    END
    ELSE
    BEGIN
        PRINT 'Application Status Successfully Updated!'
    END
END; 

--================================================================================================

--sign up procedure

CREATE PROCEDURE SignupUser
    @Name     VARCHAR(100),
    @Email    VARCHAR(150),
    @Phone    VARCHAR(20)  = NULL,
    @Age      INT          = NULL,
    @Password VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM appUser WHERE Email = @Email)
    BEGIN
        SELECT 
            'EMAIL_ALREADY_EXISTS' AS Status,
            NULL AS UserID;
        RETURN;
    END

    -- Age validation
    IF @Age IS NOT NULL AND @Age < 15
    BEGIN
        SELECT 
            'INVALID_AGE' AS Status,
            NULL AS UserID;
        RETURN;
    END

    -- Insert new user
    INSERT INTO appUser (Name, Email, Phone, Age, Password)
    VALUES (@Name, @Email, @Phone, @Age, @Password);

    -- Return new user's ID and success status
    SELECT 
        'SUCCESS'      AS Status,
        SCOPE_IDENTITY() AS UserID;
END;


--===============================================================================


--login procedure
CREATE PROCEDURE sp_LoginUser
    @Email VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM appUser WHERE Email = @Email)
    BEGIN
        SELECT 
            'USER_NOT_FOUND' AS Status,
            NULL AS UserID,
            NULL AS Name,
            NULL AS Email,
            NULL AS Password;
        RETURN;
    END

    -- Return user data for backend to verify password
    SELECT
        'SUCCESS'  AS Status,
        UserID,
        Name,
        Email,
        Password   -- backend compares the hash
    FROM appUser
    WHERE Email = @Email;
END;

--==========================================================================

--other quries for sign up and login 
--check if email already exist
SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM appUser WHERE Email = @Email)
    THEN 1 
    ELSE 0
END AS EmailExists;


--========================================================================

--data fetching for profile
SELECT 
    u.UserID,
    u.Name,
    u.Email,
    u.Phone,
    u.Age,
    u.CV_path
FROM appUser u
WHERE u.UserID = @UserID;

--=========================================================================

