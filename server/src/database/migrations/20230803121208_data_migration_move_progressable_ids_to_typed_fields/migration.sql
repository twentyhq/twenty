-- This is a manually written data migration that copies the progressable ids to the right colums in pipeline progress.
UPDATE "pipeline_progresses" SET
    "companyId"="progressableId"
WHERE "progressableType"='Company';

UPDATE "pipeline_progresses" SET
    "personId"="progressableId"
WHERE "progressableType"='Person';