
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
    p.isRemote,
    p.isActive
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
INNER JOIN appUser u ON u.userId = a.applicantId
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
    AND isActive=1
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