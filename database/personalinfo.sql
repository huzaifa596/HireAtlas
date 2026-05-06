
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
        SELECT 'USER NOT FOUND' AS Status; RETURN;
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
    SET name = @name,
        email = @email,
        phone  = @phone,
        age = @age,
        cvPath = ISNULL(@cvPath,cvPath),      
        cvFileName = ISNULL(@cvFileName, cvFileName)   
    WHERE userId = @userId;

    SELECT
        userId, name, email, phone, age, cvPath, cvFileName,
        'SUCCESS' AS Status
    FROM appUser
    WHERE userId = @userId;
END;
GO
