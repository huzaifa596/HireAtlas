

CREATE or ALTER PROCEDURE GetUserProfile
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
        cvPath,
        is_verified,
        avatarPath
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
        us.userSkillId,       
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