USE hireatlas;
GO

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
            NULL AS UserID,
            NULL AS Name,
            NULL AS Email,
            NULL AS Password;
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


--profile data fetch procedure
CREATE PROCEDURE GetUserProfile
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
        s.skillId,
        s.skillName,
        s.category,
        us.proficiency
    FROM userSkill us
    INNER JOIN skill s ON us.skillId = s.skillId
    WHERE us.userId = @UserId
    ORDER BY s.category, s.skillName;

END;

GO;
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

-- ================================================================================================
-- USER SKILL: INSERT
-- ================================================================================================
CREATE PROCEDURE insertUserSkill
    @userId      BIGINT,
    @skillId     BIGINT,
    @proficiency VARCHAR(50) = 'Beginner'
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        RAISERROR('User does not exist.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM skill WHERE skillId = @skillId)
    BEGIN
        RAISERROR('Skill not found.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM userSkill WHERE userId = @userId AND skillId = @skillId)
    BEGIN
        RAISERROR('Skill already added for this user.', 16, 1);
        RETURN;
    END

    INSERT INTO userSkill (userId, skillId, proficiency)
    VALUES (@userId, @skillId, @proficiency);
END;
GO

-- ================================================================================================
-- USER SKILL: GET
-- ================================================================================================
CREATE PROCEDURE getUserSkills
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
        s.skillId,
        s.skillName,
        s.category,
        us.proficiency
    FROM userSkill us
    INNER JOIN skill s ON us.skillId = s.skillId
    WHERE us.userId = @userId
    ORDER BY s.skillName;
END;
GO

-- ================================================================================================
-- USER SKILL: REMOVE
-- ================================================================================================
CREATE PROCEDURE removeUserSkill
    @userId  BIGINT,
    @skillId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM userSkill
        WHERE userId  = @userId
          AND skillId = @skillId
    )
    BEGIN
        RAISERROR('Skill record not found for this user.', 16, 1);
        RETURN;
    END

    DELETE FROM userSkill
    WHERE userId  = @userId
      AND skillId = @skillId;
END;
GO

-- ================================================================================================
-- TRIGGER: RESTRICT STATUS FLOW ON application
-- ================================================================================================
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
            RAISERROR('Final decisions (Accepted/Rejected) cannot be modified.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        PRINT 'Application Status Successfully Updated!';
    END
END;
GO

-- ================================================================================================
-- POST: CREATE
-- FIX: Replaced non-existent Category/EstimateSalary with correct DDL columns
--      Added all missing fields: empType, experienceLevel, isRemote, salCurrency, minSalary, maxSalary
-- ================================================================================================
CREATE PROCEDURE sp_CreatePost
    @creatorId       BIGINT,
    @companyName     VARCHAR(200)  = NULL,
    @jobTitle        VARCHAR(150),
    @description     VARCHAR(1000) = NULL,
    @location        VARCHAR(150)  = NULL,
    @empType         VARCHAR(50)   = NULL,
    @jobCategory     VARCHAR(100)  = NULL,
    @experienceLevel VARCHAR(50)   = NULL,
    @minSalary       DECIMAL(18,2) = NULL,
    @maxSalary       DECIMAL(18,2) = NULL,
    @salCurrency     VARCHAR(10)   = 'PKR',
    @isRemote        BIT           = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @creatorId)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status, NULL AS PostID;
        RETURN;
    END

    INSERT INTO post (
        creatorId, companyName, jobTitle, description, location,
        empType, jobCategory, experienceLevel,
        minSalary, maxSalary, salCurrency, isRemote
    )
    VALUES (
        @creatorId, @companyName, @jobTitle, @description, @location,
        @empType, @jobCategory, @experienceLevel,
        @minSalary, @maxSalary, @salCurrency, @isRemote
    );

    SELECT 'SUCCESS' AS Status, SCOPE_IDENTITY() AS PostID;
END;
GO

-- ================================================================================================
-- POST: UPDATE
-- FIX: Replaced Category/EstimateSalary with correct DDL columns
--      Added all missing fields: empType, experienceLevel, isRemote, salCurrency, minSalary, maxSalary
-- ================================================================================================
CREATE PROCEDURE sp_UpdatePost
    @postId          BIGINT,
    @creatorId       BIGINT,
    @companyName     VARCHAR(200)  = NULL,
    @jobTitle        VARCHAR(150)  = NULL,
    @description     VARCHAR(1000) = NULL,
    @location        VARCHAR(150)  = NULL,
    @empType         VARCHAR(50)   = NULL,
    @jobCategory     VARCHAR(100)  = NULL,
    @experienceLevel VARCHAR(50)   = NULL,
    @minSalary       DECIMAL(18,2) = NULL,
    @maxSalary       DECIMAL(18,2) = NULL,
    @salCurrency     VARCHAR(10)   = NULL,
    @isRemote        BIT           = NULL,
    @isActive        BIT           = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @creatorId)
    BEGIN
        SELECT 'POST_NOT_FOUND_OR_UNAUTHORIZED' AS Status;
        RETURN;
    END

    UPDATE post
    SET
        companyName     = ISNULL(@companyName,     companyName),
        jobTitle        = ISNULL(@jobTitle,         jobTitle),
        description     = ISNULL(@description,      description),
        location        = ISNULL(@location,         location),
        empType         = ISNULL(@empType,          empType),
        jobCategory     = ISNULL(@jobCategory,      jobCategory),
        experienceLevel = ISNULL(@experienceLevel,  experienceLevel),
        minSalary       = ISNULL(@minSalary,        minSalary),
        maxSalary       = ISNULL(@maxSalary,        maxSalary),
        salCurrency     = ISNULL(@salCurrency,      salCurrency),
        isRemote        = ISNULL(@isRemote,         isRemote),
        isActive        = ISNULL(@isActive,         isActive)
    WHERE postId    = @postId
      AND creatorId = @creatorId;

    SELECT 'SUCCESS' AS Status;
END;
GO

-- ================================================================================================
-- POST: SOFT DELETE
-- ================================================================================================
CREATE PROCEDURE sp_DeletePost
    @postId    BIGINT,
    @creatorId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @creatorId)
    BEGIN
        SELECT 'POST_NOT_FOUND_OR_UNAUTHORIZED' AS Status;
        RETURN;
    END

    UPDATE post
    SET    isActive = 0
    WHERE  postId    = @postId
      AND  creatorId = @creatorId;

    SELECT 'SUCCESS' AS Status;
END;
GO

-- ================================================================================================
-- POST: GET ALL (excluding own posts)
-- ================================================================================================
CREATE PROCEDURE sp_GetAllPosts
    @loggedInUserId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.postId,
        p.jobTitle,
        p.companyName,
        p.location,
        p.empType,
        p.jobCategory,
        p.experienceLevel,
        p.minSalary,
        p.maxSalary,
        p.salCurrency,
        p.isRemote,
        p.description,
        p.postedDate,
        u.name  AS postedBy,
        u.email AS postedByEmail
    FROM post p
    INNER JOIN appUser u ON p.creatorId = u.userId
    WHERE p.isActive  = 1
      AND p.creatorId != @loggedInUserId
    ORDER BY p.postedDate DESC;
END;
GO

-- ================================================================================================
-- POST: GET BY ID
-- FIX: Corrected table names Post_Skill → postSkill, Post_Qualification → postQualification
--      Fixed column names Category → jobCategory, EstimateSalary → minSalary/maxSalary
-- ================================================================================================
CREATE PROCEDURE sp_GetPostByID
    @postId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND isActive = 1)
    BEGIN
        SELECT 'POST_NOT_FOUND' AS Status;
        RETURN;
    END

    -- Core post details + creator info
    SELECT
        p.postId,
        p.companyName,
        p.jobTitle,
        p.description,
        p.location,
        p.empType,
        p.jobCategory,
        p.experienceLevel,
        p.minSalary,
        p.maxSalary,
        p.salCurrency,
        p.isRemote,
        p.postedDate,
        u.name  AS creatorName,
        u.email AS creatorEmail
    FROM post p
    JOIN appUser u ON u.userId = p.creatorId
    WHERE p.postId = @postId AND p.isActive = 1;

    -- Required skills
    SELECT
        s.skillId,
        s.skillName,
        s.category,
        ps.requiredLevel
    FROM postSkill ps
    JOIN skill s ON s.skillId = ps.skillId
    WHERE ps.postId = @postId;

    -- Required qualifications
    SELECT
        qualId,
        minDegree,
        fieldOfStudy,
        minGrade
    FROM postQualification
    WHERE postId = @postId;

END;

    -- Post details
    SELECT
        p.postId,
        p.jobTitle,
        p.companyName,
        p.location,
        p.empType,
        p.jobCategory,
        p.experienceLevel,
        p.minSalary,
        p.maxSalary,
        p.salCurrency,
        p.isRemote,
        p.description,
        p.postedDate,
        u.name  AS postedBy,
        u.email AS postedByEmail
    FROM post p
    INNER JOIN appUser u ON p.creatorId = u.userId
    WHERE p.postId = @postId;

    -- Required skills
    SELECT
        s.skillName,
        s.category    AS skillCategory,
        ps.requiredLevel
    FROM postSkill ps                       -- FIX: was Post_Skill
    INNER JOIN skill s ON ps.skillId = s.skillId
    WHERE ps.postId = @postId;

    -- Required qualifications
    SELECT
        qualId,
        minDegree,
        fieldOfStudy,
        minGrade
    FROM postQualification                  -- FIX: was Post_Qualification
    WHERE postId = @postId;
END;
GO

-- ================================================================================================
-- POST: GET OWN POSTS
-- FIX: Replaced Category/EstimateSalary with correct DDL columns
-- ================================================================================================
CREATE PROCEDURE sp_GetMyPosts
    @loggedInUserId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        postId,
        jobTitle,
        companyName,
        location,
        empType,
        jobCategory,
        experienceLevel,
        minSalary,
        maxSalary,
        salCurrency,
        isRemote,
        isActive,
        postedDate
    FROM post
    WHERE creatorId = @loggedInUserId
    ORDER BY postedDate DESC;
END;
GO

-- ================================================================================================
-- POST SKILL: ADD SKILL TO A POST
-- ================================================================================================
CREATE PROCEDURE sp_AddPostSkill
    @postId        BIGINT,
    @creatorId     BIGINT,
    @skillId       BIGINT,
    @requiredLevel VARCHAR(50) = 'Beginner'
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @creatorId)
    BEGIN
        RAISERROR('Post not found or unauthorized.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM skill WHERE skillId = @skillId)
    BEGIN
        RAISERROR('Skill not found.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM postSkill WHERE postId = @postId AND skillId = @skillId)
    BEGIN
        RAISERROR('This skill is already added to the post.', 16, 1);
        RETURN;
    END

    INSERT INTO postSkill (postId, skillId, requiredLevel)
    VALUES (@postId, @skillId, @requiredLevel);
END;
GO

-- ================================================================================================
-- POST SKILL: REMOVE SKILL FROM A POST
-- ================================================================================================
CREATE PROCEDURE sp_RemovePostSkill
    @postId    BIGINT,
    @creatorId BIGINT,
    @skillId   BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @creatorId)
    BEGIN
        RAISERROR('Post not found or unauthorized.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM postSkill WHERE postId = @postId AND skillId = @skillId)
    BEGIN
        RAISERROR('Skill not found on this post.', 16, 1);
        RETURN;
    END

    DELETE FROM postSkill
    WHERE postId  = @postId
      AND skillId = @skillId;
END;
GO

-- ================================================================================================
-- POST QUALIFICATION: ADD
-- ================================================================================================
CREATE PROCEDURE sp_AddPostQualification
    @postId       BIGINT,
    @creatorId    BIGINT,
    @minDegree    VARCHAR(100)  = NULL,
    @fieldOfStudy VARCHAR(150)  = NULL,
    @minGrade     DECIMAL(5,2)  = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @creatorId)
    BEGIN
        RAISERROR('Post not found or unauthorized.', 16, 1);
        RETURN;
    END

    INSERT INTO postQualification (postId, minDegree, fieldOfStudy, minGrade)
    VALUES (@postId, @minDegree, @fieldOfStudy, @minGrade);
END;
GO

-- ================================================================================================
-- POST QUALIFICATION: REMOVE
-- ================================================================================================
CREATE PROCEDURE sp_RemovePostQualification
    @qualId    BIGINT,
    @postId    BIGINT,
    @creatorId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @creatorId)
    BEGIN
        RAISERROR('Post not found or unauthorized.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM postQualification WHERE qualId = @qualId AND postId = @postId)
    BEGIN
        RAISERROR('Qualification record not found.', 16, 1);
        RETURN;
    END

    DELETE FROM postQualification
    WHERE qualId = @qualId
      AND postId = @postId;
END;
GO

-- ================================================================================================
-- APPLICATION: APPLY FOR A JOB
-- ================================================================================================
CREATE PROCEDURE sp_ApplyForJob
    @postId      BIGINT,
    @applicantId BIGINT,
    @cvPath      VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND isActive = 1)
    BEGIN
        SELECT 'POST_NOT_FOUND_OR_INACTIVE' AS Status, NULL AS ApplicationID;
        RETURN;
    END

    -- Prevent applying to own post
    IF EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @applicantId)
    BEGIN
        SELECT 'CANNOT_APPLY_TO_OWN_POST' AS Status, NULL AS ApplicationID;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM application WHERE postId = @postId AND applicantId = @applicantId)
    BEGIN
        SELECT 'ALREADY_APPLIED' AS Status, NULL AS ApplicationID;
        RETURN;
    END

    -- Use user's profile cvPath if none provided
    DECLARE @resolvedCv VARCHAR(255) = @cvPath;
    IF @resolvedCv IS NULL
        SELECT @resolvedCv = cvPath FROM appUser WHERE userId = @applicantId;

    INSERT INTO application (postId, applicantId, cvPath)
    VALUES (@postId, @applicantId, @resolvedCv);

    SELECT 'SUCCESS' AS Status, SCOPE_IDENTITY() AS ApplicationID;
END;
GO

-- ================================================================================================
-- APPLICATION: UPDATE STATUS (by post creator)
-- ================================================================================================
CREATE PROCEDURE sp_UpdateApplicationStatus
    @applicationId BIGINT,
    @creatorId     BIGINT,
    @newStatus     VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify creator owns the post tied to this application
    IF NOT EXISTS (
        SELECT 1
        FROM application a
        INNER JOIN post p ON a.postId = p.postId
        WHERE a.applicationId = @applicationId
          AND p.creatorId     = @creatorId
    )
    BEGIN
        SELECT 'APPLICATION_NOT_FOUND_OR_UNAUTHORIZED' AS Status;
        RETURN;
    END

    UPDATE application
    SET status = @newStatus
    WHERE applicationId = @applicationId;
    -- tr_RestrictStatusFlow trigger enforces no changes after Accepted/Rejected

    SELECT 'SUCCESS' AS Status;
END;
GO

-- ================================================================================================
-- APPLICATION: GET APPLICATIONS FOR A POST (for post creator)
-- ================================================================================================
CREATE PROCEDURE sp_GetApplicationsByPost
    @postId    BIGINT,
    @creatorId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM post WHERE postId = @postId AND creatorId = @creatorId)
    BEGIN
        RAISERROR('Post not found or unauthorized.', 16, 1);
        RETURN;
    END

    SELECT
        a.applicationId,
        a.applicantId,
        u.name          AS applicantName,
        u.email         AS applicantEmail,
        a.status,
        a.applicationDate,
        a.cvPath
    FROM application a
    INNER JOIN appUser u ON a.applicantId = u.userId
    WHERE a.postId = @postId
    ORDER BY a.applicationDate DESC;
END;
GO

-- ================================================================================================
-- APPLICATION: GET MY APPLICATIONS (for job seeker)
-- ================================================================================================
CREATE PROCEDURE sp_GetMyApplications
    @applicantId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.applicationId,
        a.postId,
        p.jobTitle,
        p.companyName,
        p.location,
        a.status,
        a.applicationDate,
        a.cvPath
    FROM application a
    INNER JOIN post p ON a.postId = p.postId
    WHERE a.applicantId = @applicantId
    ORDER BY a.applicationDate DESC;
END;
GO

-- ================================================================================================
-- USER PROFILE FETCH
-- ================================================================================================
CREATE PROCEDURE sp_GetUserProfile
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
        userId,
        name,
        email,
        phone,
        age,
        cvPath
    FROM appUser
    WHERE userId = @userId;
END;
GO

-- ================================================================================================
-- FILTER QUERIES
-- ================================================================================================

-- Active posts only
SELECT * FROM post WHERE isActive = 1;

-- Filter by empType
SELECT * FROM post WHERE empType = @empType AND isActive = 1;

-- Filter by experienceLevel
SELECT * FROM post WHERE experienceLevel = @level AND isActive = 1;

-- Filter by jobCategory
SELECT * FROM post WHERE jobCategory = @category AND isActive = 1;

-- Remote jobs
SELECT * FROM post WHERE isRemote = @isRemote AND isActive = 1;

-- Company name search
SELECT * FROM post WHERE companyName LIKE '%' + @company + '%' AND isActive = 1;

-- Date range (since a given date)
SELECT * FROM post WHERE postedDate >= @sinceDate AND isActive = 1;

-- Salary range
SELECT * FROM post WHERE minSalary <= @max AND maxSalary >= @min AND isActive = 1;

-- Location search
SELECT * FROM post WHERE location LIKE '%' + @city + '%' AND isActive = 1;

-- Newest first
SELECT * FROM post WHERE isActive = 1 ORDER BY postedDate DESC;

-- Highest max salary first
SELECT * FROM post WHERE isActive = 1 ORDER BY maxSalary DESC;

-- Lowest min salary first
SELECT * FROM post WHERE isActive = 1 ORDER BY minSalary ASC;

GO

-- ================================================================================================
-- COMBO FILTER: Category + Employment Type
-- ================================================================================================
CREATE PROCEDURE sp_GetPostsByCategoryAndType
    @jobCategory VARCHAR(100),
    @empType     VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM post
    WHERE isActive    = 1
      AND jobCategory = @jobCategory
      AND empType     = @empType
    ORDER BY postedDate DESC;
END;
GO

-- ================================================================================================
-- COMBO FILTER: Experience Level + Remote
-- ================================================================================================
CREATE PROCEDURE sp_GetPostsByLevelAndRemote
    @experienceLevel VARCHAR(50),
    @isRemote        BIT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM post
    WHERE isActive        = 1
      AND experienceLevel = @experienceLevel
      AND isRemote        = @isRemote
    ORDER BY postedDate DESC;
END;
GO

-- ================================================================================================
-- COMBO FILTER: Location + Salary Range
-- ================================================================================================
CREATE PROCEDURE sp_GetPostsByLocationAndSalary
    @location  VARCHAR(150),
    @minSalary DECIMAL(18,2),
    @maxSalary DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM post
    WHERE isActive  = 1
      AND location  LIKE '%' + @location + '%'
      AND minSalary <= @maxSalary
      AND maxSalary >= @minSalary
    ORDER BY postedDate DESC;
END;
GO

-- ================================================================================================
-- SEARCH: Posts by Specific Skill Name
-- ================================================================================================
CREATE PROCEDURE sp_GetPostsBySpecificSkill
    @skillName VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
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
    INNER JOIN postSkill ps ON p.postId  = ps.postId
    INNER JOIN skill s      ON ps.skillId = s.skillId
    WHERE p.isActive  = 1
      AND s.skillName = @skillName
    ORDER BY p.postedDate DESC;
END;
GO

-- ================================================================================================
-- SEARCH: Jobs Matching User's Own Skills
-- ================================================================================================
CREATE PROCEDURE mySkillJob
    @userId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.*
    FROM post p
    WHERE p.isActive = 1
      AND EXISTS (
          SELECT 1
          FROM postSkill ps
          WHERE ps.postId = p.postId
            AND EXISTS (
                SELECT 1
                FROM userSkill us
                WHERE us.userId  = @userId
                  AND us.skillId = ps.skillId
            )
      )
    ORDER BY p.postedDate DESC;
END;
GO