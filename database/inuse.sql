use freshdb
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

----------------------------------------

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
GO
----------------------------------

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
    @isRemote        BIT           = 0,

    -- Skills and qualification as JSON strings
    @skillsJson      NVARCHAR(MAX) = NULL,
    @qualJson        NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ── Validations ────────────────────────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @creatorId)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status, NULL AS PostId; RETURN;
    END

    IF @empType IS NOT NULL AND @empType NOT IN
       ('Full-Time','Part-Time','Contract','Freelance','Internship')
    BEGIN
        SELECT 'INVALID_EMP_TYPE' AS Status, NULL AS PostId; RETURN;
    END

    IF @experienceLevel IS NOT NULL AND @experienceLevel NOT IN
       ('Entry','Mid','Senior','Lead','Executive')
    BEGIN
        SELECT 'INVALID_EXPERIENCE_LEVEL' AS Status, NULL AS PostId; RETURN;
    END

    IF @minSalary IS NOT NULL AND @maxSalary IS NOT NULL AND @minSalary > @maxSalary
    BEGIN
        SELECT 'INVALID_SALARY_RANGE' AS Status, NULL AS PostId; RETURN;
    END

    -- ── Main Logic (all or nothing) ────────────────────────────────
    BEGIN TRANSACTION;
    BEGIN TRY

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

        DECLARE @newPostId BIGINT = SCOPE_IDENTITY();

        -- Insert skills if provided
        IF @skillsJson IS NOT NULL
        BEGIN
            INSERT INTO postSkill (postId, skillId, requiredLevel)
            SELECT
                @newPostId,
                skillId,
                ISNULL(requiredLevel, 'Beginner')
            FROM OPENJSON(@skillsJson)
            WITH (
                skillId       BIGINT      '$.skillId',
                requiredLevel VARCHAR(50) '$.requiredLevel'
            );
        END

        -- Insert qualification if provided
        IF @qualJson IS NOT NULL
        BEGIN
            INSERT INTO postQualification (postId, minDegree, fieldOfStudy, minGrade)
            SELECT
                @newPostId,
                minDegree,
                fieldOfStudy,
                minGrade
            FROM OPENJSON(@qualJson)
            WITH (
                minDegree    VARCHAR(100) '$.minDegree',
                fieldOfStudy VARCHAR(150) '$.fieldOfStudy',
                minGrade     DECIMAL(5,2) '$.minGrade'
            );
        END

        COMMIT TRANSACTION;
        SELECT 'SUCCESS' AS Status, @newPostId AS PostId;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT 'ERROR' AS Status, NULL AS PostId,
               ERROR_MESSAGE() AS ErrorDetail;
    END CATCH
END;
GO



-----------------------------

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
--get post by id (for public view, includes creator info and required skills/qualifications)
  
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
    WHERE postId = @postId
  
END;
GO;

----------------------------------------
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


CREATE OR ALTER PROCEDURE sp_SubmitApplication
    @postId      BIGINT,
    @applicantId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Prevent applying to own post
    IF EXISTS (
        SELECT 1 FROM post
        WHERE postId = @postId AND creatorId = @applicantId
    )
    BEGIN
        RAISERROR('You cannot apply to your own job post.', 16, 1);
        RETURN;
    END

    -- 2. Post must exist and be active
    IF NOT EXISTS (
        SELECT 1 FROM post WHERE postId = @postId AND isActive = 1
    )
    BEGIN
        RAISERROR('This job post is no longer active.', 16, 1);
        RETURN;
    END

    -- 3. No duplicate application
    IF EXISTS (
        SELECT 1 FROM application
        WHERE postId = @postId AND applicantId = @applicantId
    )
    BEGIN
        RAISERROR('You have already applied to this post.', 16, 1);
        RETURN;
    END

    -- 4. Applicant must have a CV on profile
    DECLARE @cvPath VARCHAR(255);
    SELECT @cvPath = cvPath FROM appUser WHERE userId = @applicantId;

    IF @cvPath IS NULL OR LTRIM(RTRIM(@cvPath)) = ''
    BEGIN
        RAISERROR('NO_CV_ON_PROFILE', 16, 1);
        RETURN;
    END

    -- 5. Atomic insert
    BEGIN TRY
        BEGIN TRANSACTION;

            INSERT INTO application (postId, applicantId, cvPath)
            VALUES (@postId, @applicantId, @cvPath);

            SELECT SCOPE_IDENTITY() AS applicationId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE
            @errMsg      NVARCHAR(2048) = ERROR_MESSAGE(),
            @errSeverity INT            = ERROR_SEVERITY(),
            @errState    INT            = ERROR_STATE();

        RAISERROR(@errMsg, @errSeverity, @errState);
    END CATCH
END;
GO

CREATE VIEW vw_MyApplications AS
SELECT
    a.applicationId,
    a.applicantId,
    a.status,
    a.applicationDate,
    p.postId,
    p.jobTitle,
    p.companyName,
    p.location,
    p.empType,
    p.experienceLevel,
    p.isRemote
FROM application a
INNER JOIN post p ON p.postId = a.postId;
GO

CREATE VIEW vw_PostCandidates AS
SELECT
    a.applicationId,
    a.postId,
    a.status,
    a.applicationDate,
    u.name  AS applicantName,
    u.email AS applicantEmail,
    u.cvPath AS cvPath
FROM application a
INNER JOIN appUser u ON u.userId = a.applicantId;
GO


CREATE OR ALTER PROCEDURE sp_GetMyApplications
    @applicantId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        applicationId,
        status,
        applicationDate,
        postId,
        jobTitle,
        companyName,
        location,
        empType,
        experienceLevel,
        isRemote
    FROM vw_MyApplications
    WHERE applicantId = @applicantId
    ORDER BY applicationDate DESC;
END;
GO


CREATE OR ALTER PROCEDURE sp_GetPostCandidates
    @postId      BIGINT,
    @employerId  BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify the requesting user owns this post
    IF NOT EXISTS (
        SELECT 1 FROM post
        WHERE postId = @postId AND creatorId = @employerId
    )
    BEGIN
        RAISERROR('You are not authorized to view candidates for this post.', 16, 1);
        RETURN;
    END

    SELECT
        applicationId,
        status,
        applicationDate,
        applicantName,
        applicantEmail,
        cvPath
    FROM vw_PostCandidates
    WHERE postId = @postId
    ORDER BY applicationDate ASC;
END;
GO


CREATE OR ALTER PROCEDURE sp_UpdateApplicationStatus
    @applicationId BIGINT,
    @employerId    BIGINT,
    @newStatus     VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate status value
    IF @newStatus NOT IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')
    BEGIN
        RAISERROR('Invalid status value.', 16, 1);
        RETURN;
    END

    -- Verify the employer owns the post this application belongs to
    IF NOT EXISTS (
        SELECT 1
        FROM application a
        INNER JOIN post p ON p.postId = a.postId
        WHERE a.applicationId = @applicationId
          AND p.creatorId = @employerId
    )
    BEGIN
        RAISERROR('You are not authorized to update this application.', 16, 1);
        RETURN;
    END

    UPDATE application
    SET status = @newStatus
    WHERE applicationId = @applicationId;

    SELECT @applicationId AS applicationId, @newStatus AS status;
END;
GO