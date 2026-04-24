
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
