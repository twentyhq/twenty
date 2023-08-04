-- This is a manually written data migration that ensures that the progressable ids are valid.
UPDATE "pipeline_progresses" AS pp
SET "companyId" = NULL
WHERE "companyId" IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM "companies" AS c
    WHERE c."id" = pp."companyId"
);

UPDATE "pipeline_progresses" AS pp
SET "personId" = NULL
WHERE "personId" IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM "people" AS p
    WHERE p."id" = pp."companyId"
);