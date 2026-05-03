

GO

CREATE PROCEDURE sp_AddUserSkill
    @userId      BIGINT,
    @skillName   VARCHAR(100),
    @category    VARCHAR(50)  = NULL,
    @proficiency VARCHAR(50)  = 'Beginner'
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM appUser WHERE userId = @userId)
    BEGIN
        SELECT 'USER_NOT_FOUND' AS Status; RETURN;
    END

    IF @skillName IS NULL OR LTRIM(RTRIM(@skillName)) = ''
    BEGIN
        SELECT 'INVALID_SKILL_NAME' AS Status; RETURN;
    END

    -- Upsert into skill master table
    IF NOT EXISTS (SELECT 1 FROM skill WHERE skillName = @skillName)
        INSERT INTO skill (skillName, category) VALUES (@skillName, @category);

    DECLARE @skillId BIGINT = (SELECT skillId FROM skill WHERE skillName = @skillName);

    -- Prevent duplicate user skill
    IF EXISTS (SELECT 1 FROM userSkill WHERE userId = @userId AND skillId = @skillId)
    BEGIN
        SELECT 'SKILL_ALREADY_EXISTS' AS Status; RETURN;
    END

    INSERT INTO userSkill (userId, skillId, proficiency)
    VALUES (@userId, @skillId, @proficiency);

    SELECT
        us.userSkillId,
        s.skillName,
        s.category,
        us.proficiency,
        'SUCCESS' AS Status
    FROM userSkill us
    JOIN skill s ON s.skillId = us.skillId
    WHERE us.userId = @userId AND us.skillId = @skillId;
END;
GO






----------------------------------------


GO

CREATE PROCEDURE sp_UpdateUserSkill
    @userSkillId BIGINT,
    @userId      BIGINT,
    @proficiency VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userSkill WHERE userSkillId = @userSkillId AND userId = @userId)
    BEGIN
        SELECT 'SKILL_NOT_FOUND' AS Status; RETURN;
    END

    UPDATE userSkill
    SET proficiency = @proficiency
    WHERE userSkillId = @userSkillId AND userId = @userId;

    SELECT
        us.userSkillId,
        s.skillName,
        s.category,
        us.proficiency,
        'SUCCESS' AS Status
    FROM userSkill us
    JOIN skill s ON s.skillId = us.skillId
    WHERE us.userSkillId = @userSkillId;
END;
GO

------------------------------

GO

CREATE PROCEDURE sp_DeleteUserSkill
    @userSkillId BIGINT,
    @userId      BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM userSkill WHERE userSkillId = @userSkillId AND userId = @userId)
    BEGIN
        SELECT 'SKILL_NOT_FOUND' AS Status; RETURN;
    END

    DELETE FROM userSkill WHERE userSkillId = @userSkillId AND userId = @userId;

    SELECT 'SUCCESS' AS Status;
END;
GO

