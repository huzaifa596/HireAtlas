--post getting query with application status for v2
CREATE PROCEDURE sp_GetPostByID
    @postId         BIGINT,
    @loggedInUserId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate post exists and is active
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
        u.email AS creatorEmail,
        CASE WHEN a.applicationId IS NOT NULL THEN 1 ELSE 0 END AS hasApplied,
        a.status AS applicationStatus
    FROM post p
    JOIN appUser u
        ON u.userId = p.creatorId
    LEFT JOIN application a
        ON  a.postId      = @postId
        AND a.applicantId = @loggedInUserId
    WHERE p.postId   = @postId
      AND p.isActive = 1;

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

END