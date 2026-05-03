

CREATE TRIGGER trg_ValidateEducationDates
ON userEducation
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE endDate IS NOT NULL AND startDate > endDate
    )
    BEGIN
        RAISERROR('Education startDate cannot be after endDate.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO




GO

CREATE TRIGGER trg_ValidateExperienceDates
ON userExperience
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE endDate IS NOT NULL AND startDate > endDate
    )
    BEGIN
        RAISERROR('Experience startDate cannot be after endDate.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO



GO

CREATE TRIGGER trg_CascadeDeleteUserProfile
ON appUser
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DELETE ue FROM userEducation ue
    INNER JOIN deleted d ON ue.userId = d.userId;

    DELETE ux FROM userExperience ux
    INNER JOIN deleted d ON ux.userId = d.userId;

    DELETE us FROM userSkill us
    INNER JOIN deleted d ON us.userId = d.userId;
END;
GO