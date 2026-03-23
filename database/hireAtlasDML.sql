

CREATE PROCEDURE insertEducation  
    @userId         BIGINT,
    @instituteName  VARCHAR(200),
    @level          VARCHAR(100),
    @degreeName     VARCHAR(150),
    @grade          DECIMAL(5,2),
    @startDate      DATE,
    @endDate        DATE
AS
BEGIN
    SET NOCOUNT ON;
    --turns the 1 row affected message off
    IF EXISTS (SELECT 1 FROM userEducation 
               WHERE userId = @userId 
               AND degreeName = @degreeName 
               AND instituteName = @instituteName)
    BEGIN
        RAISERROR('Duplicate education record.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        INSERT INTO userEducation (
            userId, 
            instituteName, 
            level, 
            degreeName, 
            grade, 
            startDate, 
            endDate
        )
        VALUES (
            @userId, 
            @instituteName, 
            @level, 
            @degreeName, 
            @grade, 
            @startDate, 
            @endDate
        );
    END TRY
    BEGIN CATCH
        DECLARE @Err NVARCHAR(MAX) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END;

--===============================================================

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
            RAISERROR ('Final decisions (Accepted/Rejected) cannot be modified.', 16, 1);
            ROLLBACK TRANSACTION;
        END
    END
    ELSE
    BEGIN
        PRINT 'Application Status Successfully Updated!'
    END
END; 