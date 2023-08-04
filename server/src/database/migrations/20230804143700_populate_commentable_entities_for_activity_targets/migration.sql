-- This is a manually written migration to populate company and person on the activity targets based on the previous commentable id
-- This is a one time migration and should not be run again, it could also be ran as a one-off script

UPDATE "activity_targets" as atg SET
    "companyId"="commentableId"
WHERE "commentableType"='Company'
AND "commentableId" IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM "companies" AS c
    WHERE c."id" = atg."commentableId"
);

UPDATE "activity_targets" as atg SET
    "personId"="commentableId"
WHERE "commentableType"='Person'
AND "commentableId" IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM "people" AS p
    WHERE p."id" = atg."commentableId"
);