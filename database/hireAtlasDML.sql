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
GO
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
GO
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
GO
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
GO
--================================================================================================
CREATE PROCEDURE getUserEducation
    @userId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE UserID = @userId)
    BEGIN
        RAISERROR('User does not exist.', 16, 1);
        RETURN;
    END

    SELECT 
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
--================================================================================================
CREATE PROCEDURE removeEducation
    @userId     BIGINT,
    @degreeName VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS(
        SELECT 1 FROM userEducation
        WHERE userId = @userId 
        AND degreeName = @degreeName
    )
    BEGIN
        RAISERROR('Education record not found.', 16, 1);
        RETURN;
    END

    DELETE FROM userEducation
    WHERE userId = @userId 
    AND degreeName = @degreeName;
END;
GO
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
GO

--===============================================================================


--login procedure
CREATE PROCEDURE LoginUser
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
    u.cvPath
FROM appUser u
WHERE u.UserID = @UserID;

--=========================================================================

--query to filter all the non active posts 

SELECT * FROM post
WHERE isActive=1
--=========================================================================
-- empType filter

SELECT * FROM post
WHERE empType=@empType

--=========================================================================
--filter by experiencelevel

SELECT * FROM post 
WHERE experienceLevel = @level

--=========================================================================
--filter by job category

SELECT * FROM post 
WHERE jobCategory = @category
--=========================================================================
--remote jobs finder

SELECT * FROM post
WHERE isRemote = @isRemote
--=======================================================================

--company name filter

SELECT * FROM post
WHERE companyName LIKE '%' + @company + '%'
--=========================================================================

--Date range
SELECT * FROM post
WHERE postedDate >= @sinceDate
--========================================================================

--Salary range	
SELECT * FROM post
WHERE minSalary <= @max AND maxSalary >= @min

--========================================================================

--Location	
SELECT * FROM post
WHERE location LIKE '%' + @city + '%'
--========================================================================
-- #18 newest
SELECT * FROM post
WHERE isActive = 1
ORDER BY postedDate DESC;

--========================================================================
-- #19 max salary
SELECT * FROM post 
WHERE isActive = 1 
ORDER BY maxSalary DESC;

--========================================================================
-- #20  min salary
SELECT * FROM post 
WHERE isActive = 1 
ORDER BY minSalary ASC;
GO
--========================================================================
-- Category + Type Combo
CREATE PROCEDURE sp_GetPostsByCategoryAndType
    @jobCategory VARCHAR(100),
    @empType VARCHAR(50)
AS
BEGIN
    SELECT * FROM post 
    WHERE isActive = 1 
      AND jobCategory = @jobCategory 
      AND empType = @empType
    ORDER BY postedDate DESC;
END;
GO
--========================================================================
--Level + Remote Combo
CREATE PROCEDURE sp_GetPostsByLevelAndRemote
    @experienceLevel VARCHAR(50),
    @isRemote BIT
AS
BEGIN
    SELECT * FROM post 
    WHERE isActive = 1 
      AND experienceLevel = @experienceLevel 
      AND isRemote = @isRemote
    ORDER BY postedDate DESC;
END;
GO
--========================================================================
--Location + Salary Combo
CREATE PROCEDURE sp_GetPostsByLocationAndSalary
    @location VARCHAR(150),
    @minSalary DECIMAL(18,2),
    @maxSalary DECIMAL(18,2)
AS
BEGIN
    SELECT * FROM post 
    WHERE isActive = 1 
      AND location LIKE '%' + @location + '%'
      AND minSalary <= @maxSalary 
      AND maxSalary >= @minSalary
    ORDER BY postedDate DESC;
END;
GO
--========================================================================
--SpecificSkillSearch
CREATE PROCEDURE sp_GetPostsBySpecificSkill
    @skillName VARCHAR(100)
AS
BEGIN
    SELECT 
        p.postId,
        p.jobTitle,
        p.companyName,
        p.location,
        p.empType,
        p.experienceLevel,
        p.minSalary,
        p.maxSalary,
        p.postedDate,
        s.skillName,
        ps.requiredLevel
    FROM post p
    INNER JOIN postSkill ps ON p.postId = ps.postId
    INNER JOIN skill s ON ps.skillId = s.skillId
    WHERE p.isActive = 1
      AND s.skillName = @skillName
    ORDER BY p.postedDate DESC;
END;
GO
--=========================================================================
--Jobs matching my skill procedure
CREATE PROCEDURE mySkillJob
    @UserID BIGINT
AS
BEGIN
    SELECT p.* 
    FROM post p
    WHERE EXISTS(
        SELECT 1 FROM postSkill ps
        WHERE EXISTS(
            SELECT 1 FROM userSkill us
            WHERE us.userId = @UserID
              AND us.skillId = ps.skillId
        )
        AND p.postId = ps.postId 
    )
    AND p.isActive = 1  
    ORDER BY p.postedDate DESC;
END;
GO
--========================================================================
--post procedure for creating a new job post
CREATE PROCEDURE sp_CreatePost
    @CreatorID      BIGINT,
    @CompanyName    VARCHAR(200)  = NULL,
    @JobTitle       VARCHAR(150),
    @Description    VARCHAR(1000) = NULL,
    @Location       VARCHAR(150)  = NULL,
    @Category       VARCHAR(100)  = NULL,
    @EstimateSalary DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check user exists
    IF NOT EXISTS (SELECT 1 FROM appUser WHERE UserID = @CreatorID)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status, NULL AS PostID;
        RETURN;
    END

    -- Insert post
    INSERT INTO Post (CreatorID, CompanyName, JobTitle, Description, Location, Category, EstimateSalary)
    VALUES (@CreatorID, @CompanyName, @JobTitle, @Description, @Location, @Category, @EstimateSalary);

    SELECT 
        'SUCCESS'        AS Status,
        SCOPE_IDENTITY() AS PostID;
END;


--====================
--procedure to update a post
CREATE PROCEDURE sp_UpdatePost
    @PostID         BIGINT,
    @CreatorID      BIGINT,
    @CompanyName    VARCHAR(200)  = NULL,
    @JobTitle       VARCHAR(150)  = NULL,
    @Description    VARCHAR(1000) = NULL,
    @Location       VARCHAR(150)  = NULL,
    @Category       VARCHAR(100)  = NULL,
    @EstimateSalary DECIMAL(18,2) = NULL,
    @IsActive       BIT           = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check post exists and belongs to this user
    IF NOT EXISTS (SELECT 1 FROM Post WHERE PostID = @PostID AND CreatorID = @CreatorID)
    BEGIN
        SELECT 'POST_NOT_FOUND_OR_UNAUTHORIZED' AS Status;
        RETURN;
    END

    -- Update only fields that are passed
    UPDATE Post
    SET
        CompanyName    = ISNULL(@CompanyName,    CompanyName),
        JobTitle       = ISNULL(@JobTitle,        JobTitle),
        Description    = ISNULL(@Description,     Description),
        Location       = ISNULL(@Location,        Location),
        Category       = ISNULL(@Category,        Category),
        EstimateSalary = ISNULL(@EstimateSalary,  EstimateSalary),
        IsActive       = ISNULL(@IsActive,        IsActive)
    WHERE PostID    = @PostID
      AND CreatorID = @CreatorID;

    SELECT 'SUCCESS' AS Status;
END;

--=======================
--procedure to delete a post
CREATE PROCEDURE sp_DeletePost
    @PostID    BIGINT,
    @CreatorID BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check post exists and belongs to this user
    IF NOT EXISTS (SELECT 1 FROM Post WHERE PostID = @PostID AND CreatorID = @CreatorID)
    BEGIN
        SELECT 'POST_NOT_FOUND_OR_UNAUTHORIZED' AS Status;
        RETURN;
    END

    DELETE FROM Post
    WHERE PostID    = @PostID
      AND CreatorID = @CreatorID;

    SELECT 'SUCCESS' AS Status;
END;

--=====================
--getting all posts
CREATE PROCEDURE sp_GetAllPosts
    @LoggedInUserID BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.PostID,
        p.JobTitle,
        p.CompanyName,
        p.Location,
        p.Category,
        p.EstimateSalary,
        p.Description,
        p.PostedDate,
        u.Name  AS PostedBy,
        u.Email AS PostedByEmail
    FROM Post p
    INNER JOIN appUser u ON p.CreatorID = u.UserID
    WHERE p.IsActive = 1
      AND p.CreatorID != @LoggedInUserID  -- 👈 hide own posts
    ORDER BY p.PostedDate DESC;
END;