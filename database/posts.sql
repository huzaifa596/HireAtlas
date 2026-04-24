
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
    WHERE postId = @postId;  
  
END;  

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
