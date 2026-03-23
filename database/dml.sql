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

--other quries for sign up and login 
--check if email already exist
SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM appUser WHERE Email = @Email)
    THEN 1 ELSE 0
END AS EmailExists;

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
