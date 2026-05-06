USE hireatlas;
GO



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