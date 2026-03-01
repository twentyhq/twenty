-- Lead Deduplication by Phone Number
-- ==================================
-- This script deduplicates person records that share the same phone number.
--
-- Strategy:
--   1. For each group of duplicates, pick a "keeper" record:
--      - Prefer records that have policies attached (never delete those)
--      - Then prefer the most complete record (most non-null fields)
--      - Then prefer the most recently updated record
--   2. Merge non-null fields from duplicates into the keeper
--   3. Re-point all FK references from duplicates to the keeper
--   4. Soft-delete the duplicate records
--
-- Prerequisites:
--   - Drop the email unique index first (it blocks the merge step):
--     DROP INDEX IF EXISTS <SCHEMA>."IDX_UNIQUE_<hash>";
--     (Find the exact name with: \di <SCHEMA>.*email*)
--
-- Usage:
--   1. Replace <SCHEMA> with your workspace schema name (e.g., workspace_abc123)
--   2. Run the diagnostic query first to understand the scope
--   3. Run the full script inside a transaction (BEGIN / COMMIT or ROLLBACK)

-- ============================================================
-- STEP 0: SET YOUR SCHEMA (replace this placeholder everywhere)
-- ============================================================
-- Find your schema name:
--   SELECT nspname FROM pg_namespace WHERE nspname LIKE 'workspace_%';
--
-- Then find/replace <SCHEMA> with the actual schema name below.
-- Custom object tables are prefixed with _ (e.g. _policy, _call, _familyMember)
-- Standard object tables have no prefix (e.g. person, opportunity, favorite)

-- ============================================================
-- STEP 1: DIAGNOSTIC — Run this first to assess scope
-- ============================================================

SELECT "phonesPrimaryPhoneNumber", COUNT(*) as dup_count,
       ARRAY_AGG(id ORDER BY "updatedAt" DESC) as person_ids
FROM <SCHEMA>.person
WHERE "phonesPrimaryPhoneNumber" IS NOT NULL
  AND "phonesPrimaryPhoneNumber" != ''
  AND "deletedAt" IS NULL
GROUP BY "phonesPrimaryPhoneNumber"
HAVING COUNT(*) > 1
ORDER BY dup_count DESC;

-- ============================================================
-- STEP 2: FULL DEDUP — Run as a single script in one session
-- ============================================================

BEGIN;

CREATE TEMP TABLE person_dedup AS
WITH duplicates AS (
  SELECT
    p.id,
    p."phonesPrimaryPhoneNumber" as phone,
    p."updatedAt",
    (CASE WHEN p."nameFirstName" IS NOT NULL AND p."nameFirstName" != '' THEN 1 ELSE 0 END
     + CASE WHEN p."nameLastName" IS NOT NULL AND p."nameLastName" != '' THEN 1 ELSE 0 END
     + CASE WHEN p."emailsPrimaryEmail" IS NOT NULL AND p."emailsPrimaryEmail" != '' THEN 1 ELSE 0 END
     + CASE WHEN p."city" IS NOT NULL AND p."city" != '' THEN 1 ELSE 0 END
     + CASE WHEN p."jobTitle" IS NOT NULL AND p."jobTitle" != '' THEN 1 ELSE 0 END
     + CASE WHEN p."companyId" IS NOT NULL THEN 1 ELSE 0 END
     + CASE WHEN p."position" IS NOT NULL THEN 1 ELSE 0 END
    ) as completeness_score,
    CASE WHEN EXISTS (
      SELECT 1 FROM <SCHEMA>."_policy" pol
      WHERE pol."leadId" = p.id AND pol."deletedAt" IS NULL
    ) THEN 1 ELSE 0 END as has_policies,
    CASE WHEN EXISTS (
      SELECT 1 FROM <SCHEMA>."_call" c
      WHERE c."leadId" = p.id AND c."deletedAt" IS NULL
    ) THEN 1 ELSE 0 END as has_calls
  FROM <SCHEMA>.person p
  WHERE p."phonesPrimaryPhoneNumber" IS NOT NULL
    AND p."phonesPrimaryPhoneNumber" != ''
    AND p."deletedAt" IS NULL
    AND p."phonesPrimaryPhoneNumber" IN (
      SELECT "phonesPrimaryPhoneNumber"
      FROM <SCHEMA>.person
      WHERE "phonesPrimaryPhoneNumber" IS NOT NULL
        AND "phonesPrimaryPhoneNumber" != ''
        AND "deletedAt" IS NULL
      GROUP BY "phonesPrimaryPhoneNumber"
      HAVING COUNT(*) > 1
    )
),
ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY phone
      ORDER BY
        has_policies DESC,
        has_calls DESC,
        completeness_score DESC,
        "updatedAt" DESC
    ) as rank
  FROM duplicates
)
SELECT id, phone, rank,
  CASE WHEN rank = 1 THEN 'keeper' ELSE 'duplicate' END as disposition
FROM ranked;

SELECT disposition, COUNT(*) FROM person_dedup GROUP BY disposition;

-- MERGE: Fill blanks on keepers from duplicates
UPDATE <SCHEMA>.person keeper SET
  "nameFirstName" = COALESCE(NULLIF(keeper."nameFirstName", ''),
    (SELECT d."nameFirstName" FROM <SCHEMA>.person d
     INNER JOIN person_dedup pd ON pd.id = d.id AND pd.disposition = 'duplicate' AND pd.phone = kpd.phone
     WHERE d."nameFirstName" IS NOT NULL AND d."nameFirstName" != '' ORDER BY d."updatedAt" DESC LIMIT 1)),
  "nameLastName" = COALESCE(NULLIF(keeper."nameLastName", ''),
    (SELECT d."nameLastName" FROM <SCHEMA>.person d
     INNER JOIN person_dedup pd ON pd.id = d.id AND pd.disposition = 'duplicate' AND pd.phone = kpd.phone
     WHERE d."nameLastName" IS NOT NULL AND d."nameLastName" != '' ORDER BY d."updatedAt" DESC LIMIT 1)),
  "emailsPrimaryEmail" = COALESCE(NULLIF(keeper."emailsPrimaryEmail", ''),
    (SELECT d."emailsPrimaryEmail" FROM <SCHEMA>.person d
     INNER JOIN person_dedup pd ON pd.id = d.id AND pd.disposition = 'duplicate' AND pd.phone = kpd.phone
     WHERE d."emailsPrimaryEmail" IS NOT NULL AND d."emailsPrimaryEmail" != '' ORDER BY d."updatedAt" DESC LIMIT 1)),
  "city" = COALESCE(NULLIF(keeper."city", ''),
    (SELECT d."city" FROM <SCHEMA>.person d
     INNER JOIN person_dedup pd ON pd.id = d.id AND pd.disposition = 'duplicate' AND pd.phone = kpd.phone
     WHERE d."city" IS NOT NULL AND d."city" != '' ORDER BY d."updatedAt" DESC LIMIT 1)),
  "jobTitle" = COALESCE(NULLIF(keeper."jobTitle", ''),
    (SELECT d."jobTitle" FROM <SCHEMA>.person d
     INNER JOIN person_dedup pd ON pd.id = d.id AND pd.disposition = 'duplicate' AND pd.phone = kpd.phone
     WHERE d."jobTitle" IS NOT NULL AND d."jobTitle" != '' ORDER BY d."updatedAt" DESC LIMIT 1)),
  "companyId" = COALESCE(keeper."companyId",
    (SELECT d."companyId" FROM <SCHEMA>.person d
     INNER JOIN person_dedup pd ON pd.id = d.id AND pd.disposition = 'duplicate' AND pd.phone = kpd.phone
     WHERE d."companyId" IS NOT NULL ORDER BY d."updatedAt" DESC LIMIT 1))
FROM person_dedup kpd WHERE keeper.id = kpd.id AND kpd.disposition = 'keeper';

-- RE-POINT FKs: Custom objects (prefixed with _)
UPDATE <SCHEMA>."_policy" SET "leadId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "_policy"."leadId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>."_call" SET "leadId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "_call"."leadId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>."_familyMember" SET "leadId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "_familyMember"."leadId" = dup.id AND dup.disposition = 'duplicate';

-- RE-POINT FKs: Standard objects
UPDATE <SCHEMA>.opportunity SET "pointOfContactId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE opportunity."pointOfContactId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>.favorite SET "personId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE favorite."personId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>.attachment SET "targetPersonId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE attachment."targetPersonId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>."noteTarget" SET "targetPersonId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "noteTarget"."targetPersonId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>."taskTarget" SET "targetPersonId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "taskTarget"."targetPersonId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>."timelineActivity" SET "targetPersonId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "timelineActivity"."targetPersonId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>."calendarEventParticipant" SET "personId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "calendarEventParticipant"."personId" = dup.id AND dup.disposition = 'duplicate';

UPDATE <SCHEMA>."messageParticipant" SET "personId" = keeper.id
FROM person_dedup dup INNER JOIN person_dedup keeper ON keeper.phone = dup.phone AND keeper.disposition = 'keeper'
WHERE "messageParticipant"."personId" = dup.id AND dup.disposition = 'duplicate';

-- SOFT-DELETE duplicates
UPDATE <SCHEMA>.person
SET "deletedAt" = NOW()
FROM person_dedup pd
WHERE person.id = pd.id AND pd.disposition = 'duplicate';

-- VERIFY
SELECT 'remaining_duplicates' as check_name, COUNT(*)::text as result FROM (
  SELECT "phonesPrimaryPhoneNumber"
  FROM <SCHEMA>.person
  WHERE "phonesPrimaryPhoneNumber" IS NOT NULL AND "phonesPrimaryPhoneNumber" != '' AND "deletedAt" IS NULL
  GROUP BY "phonesPrimaryPhoneNumber" HAVING COUNT(*) > 1
) t
UNION ALL
SELECT 'orphaned_policies', COUNT(*)::text FROM <SCHEMA>."_policy" pol
  LEFT JOIN <SCHEMA>.person p ON p.id = pol."leadId" AND p."deletedAt" IS NULL
  WHERE pol."deletedAt" IS NULL AND pol."leadId" IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'orphaned_calls', COUNT(*)::text FROM <SCHEMA>."_call" c
  LEFT JOIN <SCHEMA>.person p ON p.id = c."leadId" AND p."deletedAt" IS NULL
  WHERE c."deletedAt" IS NULL AND c."leadId" IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'duplicates_removed', COUNT(*)::text FROM person_dedup WHERE disposition = 'duplicate';

DROP TABLE IF EXISTS person_dedup;

-- ============================================================
-- REVIEW THE RESULTS, THEN:
--   COMMIT;   -- to apply changes
--   ROLLBACK; -- to undo everything
-- ============================================================
