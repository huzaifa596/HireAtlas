
-- ================================================================================================
-- SIGN UP PROCEDURE
-- ================================================================================================
CREATE PROCEDURE SignupUser
    @Name     VARCHAR(100),
    @Email    VARCHAR(150),
    @Phone    VARCHAR(20)  = NULL,
    @Age      INT          = NULL,
    @Password VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM appUser WHERE email = @Email)
    BEGIN
        SELECT 'EMAIL_ALREADY_EXISTS' AS Status, NULL AS UserID;
        RETURN;
    END

    IF @Age IS NOT NULL AND @Age < 15
    BEGIN
        SELECT 'INVALID_AGE' AS Status, NULL AS UserID;
        RETURN;
    END

    INSERT INTO appUser (name, email, phone, age, password)
    VALUES (@Name, @Email, @Phone, @Age, @Password);

    SELECT 'SUCCESS' AS Status, SCOPE_IDENTITY() AS UserID;
END;
GO

-- ================================================================================================
-- LOGIN PROCEDURE
-- ================================================================================================
CREATE PROCEDURE LoginUser
    @Email VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE email = @Email)
    BEGIN
        SELECT
            'USER_NOT_FOUND' AS Status,
            NULL AS userId,
            NULL AS Name,
            NULL AS Email,
            NULL AS password;
        RETURN;
    END

    SELECT
        'SUCCESS' AS Status,
        userId,
        name,
        email,
        password   -- backend compares the hash
    FROM appUser
    WHERE email = @Email;
END;
GO

