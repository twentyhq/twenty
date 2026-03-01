-- =============================================================================
-- Lead Deduplication by Name Matching
-- =============================================================================
-- This script handles two categories:
--   1. Named phoneless leads that match a lead WITH a phone (merge into phone lead)
--   2. Nameless + phoneless empty ghost leads (soft-delete)
--
-- Merge strategy: keep the "richer" lead (has phone), absorb any non-empty
-- fields from the duplicate, re-point all FK references, then soft-delete dup.
-- =============================================================================

SET search_path TO workspace_oyoiha4z71ppw867jthfb36d;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 1: Preview name-matched duplicates before merging
-- ─────────────────────────────────────────────────────────────────────────────

-- Show all name-match pairs: phoneless lead → lead with phone
CREATE TEMP TABLE name_merge_pairs AS
SELECT DISTINCT ON (dup.id)
  dup.id   AS dup_id,
  keeper.id AS keeper_id,
  dup."nameFirstName" AS dup_first,
  dup."nameLastName" AS dup_last,
  keeper."nameFirstName" AS keeper_first,
  keeper."nameLastName" AS keeper_last,
  keeper."phonesPrimaryPhoneNumber" AS keeper_phone
FROM person dup
JOIN person keeper
  ON LOWER(TRIM(dup."nameFirstName")) = LOWER(TRIM(keeper."nameFirstName"))
  AND LOWER(TRIM(dup."nameLastName")) = LOWER(TRIM(keeper."nameLastName"))
  AND keeper.id != dup.id
  AND keeper."deletedAt" IS NULL
  AND keeper."phonesPrimaryPhoneNumber" IS NOT NULL
  AND keeper."phonesPrimaryPhoneNumber" != ''
WHERE dup."deletedAt" IS NULL
  AND (dup."phonesPrimaryPhoneNumber" IS NULL OR dup."phonesPrimaryPhoneNumber" = '')
  AND dup."nameFirstName" IS NOT NULL
  AND dup."nameFirstName" != ''
-- If a phoneless lead matches multiple phone leads, pick the one with most policies
ORDER BY dup.id, (
  SELECT COUNT(*) FROM _policy pol
  WHERE pol."leadId" = keeper.id AND pol."deletedAt" IS NULL
) DESC, keeper."createdAt" ASC;

\echo '=== NAME-MATCH PAIRS (phoneless dup → keeper with phone) ==='
SELECT nmp.*,
  (SELECT COUNT(*) FROM _policy WHERE "leadId" = nmp.dup_id AND "deletedAt" IS NULL) AS dup_policies,
  (SELECT COUNT(*) FROM _call WHERE "leadId" = nmp.dup_id AND "deletedAt" IS NULL) AS dup_calls,
  (SELECT COUNT(*) FROM _policy WHERE "leadId" = nmp.keeper_id AND "deletedAt" IS NULL) AS keeper_policies,
  (SELECT COUNT(*) FROM _call WHERE "leadId" = nmp.keeper_id AND "deletedAt" IS NULL) AS keeper_calls
FROM name_merge_pairs nmp
ORDER BY dup_last, dup_first;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 2: Merge fields from dup into keeper (fill gaps only, never overwrite)
-- ─────────────────────────────────────────────────────────────────────────────

\echo '=== MERGING FIELDS: filling empty keeper fields from duplicate ==='

UPDATE person keeper SET
  -- Name: use keeper's casing (they have the phone record), but fill if empty
  "nameFirstName"  = COALESCE(NULLIF(keeper."nameFirstName", ''),  dup."nameFirstName"),
  "nameLastName"   = COALESCE(NULLIF(keeper."nameLastName", ''),   dup."nameLastName"),
  -- Email
  "emailsPrimaryEmail" = COALESCE(NULLIF(keeper."emailsPrimaryEmail", ''), dup."emailsPrimaryEmail"),
  -- City & address
  "city" = COALESCE(NULLIF(keeper."city", ''), dup."city"),
  "addressCustomAddressStreet1" = COALESCE(NULLIF(keeper."addressCustomAddressStreet1", ''), dup."addressCustomAddressStreet1"),
  "addressCustomAddressStreet2" = COALESCE(NULLIF(keeper."addressCustomAddressStreet2", ''), dup."addressCustomAddressStreet2"),
  "addressCustomAddressCity"    = COALESCE(NULLIF(keeper."addressCustomAddressCity", ''),    dup."addressCustomAddressCity"),
  "addressCustomAddressPostcode"= COALESCE(NULLIF(keeper."addressCustomAddressPostcode", ''),dup."addressCustomAddressPostcode"),
  "addressCustomAddressState"   = COALESCE(NULLIF(keeper."addressCustomAddressState", ''),   dup."addressCustomAddressState"),
  "addressCustomAddressCountry" = COALESCE(NULLIF(keeper."addressCustomAddressCountry", ''), dup."addressCustomAddressCountry"),
  -- Job / social
  "jobTitle" = COALESCE(NULLIF(keeper."jobTitle", ''), dup."jobTitle"),
  "linkedinLinkPrimaryLinkUrl" = COALESCE(NULLIF(keeper."linkedinLinkPrimaryLinkUrl", ''), dup."linkedinLinkPrimaryLinkUrl"),
  "xLinkPrimaryLinkUrl"        = COALESCE(NULLIF(keeper."xLinkPrimaryLinkUrl", ''),        dup."xLinkPrimaryLinkUrl"),
  -- Demographics
  "dateOfBirth" = COALESCE(keeper."dateOfBirth", dup."dateOfBirth"),
  "gender"      = COALESCE(keeper."gender", dup."gender"),
  -- Lead fields
  "leadStatus"    = COALESCE(keeper."leadStatus", dup."leadStatus"),
  "leadSourceId"  = COALESCE(keeper."leadSourceId", dup."leadSourceId"),
  "assignedAgentId" = COALESCE(keeper."assignedAgentId", dup."assignedAgentId"),
  -- Avatar
  "avatarUrl" = COALESCE(NULLIF(keeper."avatarUrl", ''), dup."avatarUrl"),
  -- Preferences
  "doNotCall"  = COALESCE(keeper."doNotCall", dup."doNotCall"),
  "doNotEmail" = COALESCE(keeper."doNotEmail", dup."doNotEmail"),
  -- Timestamp
  "updatedAt" = NOW()
FROM name_merge_pairs nmp
JOIN person dup ON dup.id = nmp.dup_id
WHERE keeper.id = nmp.keeper_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 3: Re-point all FK references from dup → keeper
-- ─────────────────────────────────────────────────────────────────────────────

\echo '=== RE-POINTING FK REFERENCES ==='

-- Custom objects (leadId)
UPDATE _policy SET "leadId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE _policy."leadId" = nmp.dup_id AND _policy."deletedAt" IS NULL;

UPDATE _call SET "leadId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE _call."leadId" = nmp.dup_id AND _call."deletedAt" IS NULL;

UPDATE "_familyMember" SET "leadId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE "_familyMember"."leadId" = nmp.dup_id AND "_familyMember"."deletedAt" IS NULL;

-- Standard objects (targetPersonId)
UPDATE attachment SET "targetPersonId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE attachment."targetPersonId" = nmp.dup_id AND attachment."deletedAt" IS NULL;

UPDATE "noteTarget" SET "targetPersonId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE "noteTarget"."targetPersonId" = nmp.dup_id AND "noteTarget"."deletedAt" IS NULL;

UPDATE "taskTarget" SET "targetPersonId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE "taskTarget"."targetPersonId" = nmp.dup_id AND "taskTarget"."deletedAt" IS NULL;

UPDATE "timelineActivity" SET "targetPersonId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE "timelineActivity"."targetPersonId" = nmp.dup_id AND "timelineActivity"."deletedAt" IS NULL;

-- Standard objects (personId)
UPDATE favorite SET "personId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE favorite."personId" = nmp.dup_id AND favorite."deletedAt" IS NULL;

UPDATE "calendarEventParticipant" SET "personId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE "calendarEventParticipant"."personId" = nmp.dup_id AND "calendarEventParticipant"."deletedAt" IS NULL;

UPDATE "messageParticipant" SET "personId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE "messageParticipant"."personId" = nmp.dup_id AND "messageParticipant"."deletedAt" IS NULL;

-- Opportunity (pointOfContactId)
UPDATE opportunity SET "pointOfContactId" = nmp.keeper_id, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE opportunity."pointOfContactId" = nmp.dup_id AND opportunity."deletedAt" IS NULL;

-- Self-reference: person.leadId (text column, needs cast)
UPDATE person SET "leadId" = nmp.keeper_id::text, "updatedAt" = NOW()
FROM name_merge_pairs nmp WHERE person."leadId" = nmp.dup_id::text AND person."deletedAt" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 4: Soft-delete the duplicate leads
-- ─────────────────────────────────────────────────────────────────────────────

\echo '=== SOFT-DELETING DUPLICATE LEADS ==='

UPDATE person SET "deletedAt" = NOW()
FROM name_merge_pairs nmp
WHERE person.id = nmp.dup_id AND person."deletedAt" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 5: Soft-delete empty ghost leads (no name, no phone, no email, no data)
-- ─────────────────────────────────────────────────────────────────────────────

\echo '=== IDENTIFYING EMPTY GHOST LEADS ==='

CREATE TEMP TABLE ghost_leads AS
SELECT p.id
FROM person p
WHERE p."deletedAt" IS NULL
  AND (p."nameFirstName" IS NULL OR p."nameFirstName" = '')
  AND (p."nameLastName" IS NULL OR p."nameLastName" = '')
  AND (p."phonesPrimaryPhoneNumber" IS NULL OR p."phonesPrimaryPhoneNumber" = '')
  AND (p."emailsPrimaryEmail" IS NULL OR p."emailsPrimaryEmail" = '')
  -- Only delete if truly empty: no policies, calls, notes, tasks
  AND NOT EXISTS (SELECT 1 FROM _policy WHERE "leadId" = p.id AND "deletedAt" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM _call WHERE "leadId" = p.id AND "deletedAt" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM "noteTarget" WHERE "targetPersonId" = p.id AND "deletedAt" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM "taskTarget" WHERE "targetPersonId" = p.id AND "deletedAt" IS NULL);

SELECT COUNT(*) AS ghost_leads_to_delete FROM ghost_leads;

UPDATE person SET "deletedAt" = NOW()
FROM ghost_leads gl
WHERE person.id = gl.id AND person."deletedAt" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 6: Verification
-- ─────────────────────────────────────────────────────────────────────────────

\echo '=== VERIFICATION ==='

-- Remaining phoneless leads
SELECT 'remaining_phoneless_with_name' AS check_name, COUNT(*) AS cnt
FROM person
WHERE "deletedAt" IS NULL
  AND ("phonesPrimaryPhoneNumber" IS NULL OR "phonesPrimaryPhoneNumber" = '')
  AND "nameFirstName" IS NOT NULL AND "nameFirstName" != ''
UNION ALL
SELECT 'remaining_nameless_phoneless', COUNT(*)
FROM person
WHERE "deletedAt" IS NULL
  AND ("phonesPrimaryPhoneNumber" IS NULL OR "phonesPrimaryPhoneNumber" = '')
  AND ("nameFirstName" IS NULL OR "nameFirstName" = '')
UNION ALL
-- Orphan check: any active policies/calls pointing to deleted leads?
SELECT 'orphaned_policies', COUNT(*)
FROM _policy pol
WHERE pol."deletedAt" IS NULL
  AND pol."leadId" IN (SELECT id FROM person WHERE "deletedAt" IS NOT NULL)
UNION ALL
SELECT 'orphaned_calls', COUNT(*)
FROM _call c
WHERE c."deletedAt" IS NULL
  AND c."leadId" IN (SELECT id FROM person WHERE "deletedAt" IS NOT NULL);

\echo '=== DONE ==='
