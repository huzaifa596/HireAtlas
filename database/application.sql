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