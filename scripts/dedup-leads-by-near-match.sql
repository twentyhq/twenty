-- =============================================================================
-- Dedup Leads by Near-Match (same name + phone differs by 1-2 digits or
-- truncated phone or very similar email pattern)
-- =============================================================================
-- Run after dedup-leads-by-phone.sql and dedup-leads-by-name.sql
--
-- 12 pairs identified. For each: merge data into keeper, re-point FKs,
-- soft-delete the duplicate.
-- =============================================================================

SET search_path TO workspace_oyoiha4z71ppw867jthfb36d;

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: For each pair, we:
--   1. Move policies from dupe → keeper
--   2. Move calls from dupe → keeper
--   3. Move family members from dupe → keeper
--   4. Move other FK references (opportunity, favorite, attachment, etc.)
--   5. Fill missing email on keeper from dupe if keeper has none
--   6. Soft-delete the dupe
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Tobius Arnold
--    KEEP: 2cdeeca3 (phone 8646526008, email tobiusarnold@gmail.com, 1 policy)
--    DUPE: 383a431b (phone 8646526011, no email, 1 policy)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '2cdeeca3-9639-482c-b317-e3088bb32a8f', "updatedAt" = NOW()
  WHERE "leadId" = '383a431b-7ce7-4ead-90cc-6ac93d0947d0' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '2cdeeca3-9639-482c-b317-e3088bb32a8f', "updatedAt" = NOW()
  WHERE "leadId" = '383a431b-7ce7-4ead-90cc-6ac93d0947d0' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '2cdeeca3-9639-482c-b317-e3088bb32a8f', "updatedAt" = NOW()
  WHERE "leadId" = '383a431b-7ce7-4ead-90cc-6ac93d0947d0' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = '383a431b-7ce7-4ead-90cc-6ac93d0947d0' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Daryl Cassel
--    KEEP: 55f88b7d (phone 8733130566, 2 policies)
--    DUPE: 089b680e (phone 5733130566, email weo_cassel1991@yahoo.com, 1 call)
--    → also copy email to keeper
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE person SET "emailsPrimaryEmail" = 'weo_cassel1991@yahoo.com', "updatedAt" = NOW()
  WHERE id = '55f88b7d-cf2d-4060-a500-e5909a3f445b' AND "emailsPrimaryEmail" IS NULL AND "deletedAt" IS NULL;
UPDATE "_policy" SET "leadId" = '55f88b7d-cf2d-4060-a500-e5909a3f445b', "updatedAt" = NOW()
  WHERE "leadId" = '089b680e-d704-4295-8b67-a86d67e8e2b5' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '55f88b7d-cf2d-4060-a500-e5909a3f445b', "updatedAt" = NOW()
  WHERE "leadId" = '089b680e-d704-4295-8b67-a86d67e8e2b5' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '55f88b7d-cf2d-4060-a500-e5909a3f445b', "updatedAt" = NOW()
  WHERE "leadId" = '089b680e-d704-4295-8b67-a86d67e8e2b5' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = '089b680e-d704-4295-8b67-a86d67e8e2b5' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Oscar Dominguez
--    KEEP: 3f3a0d26 (phone 3616088531, email dominguezsquad214@gmail.com, 1 policy)
--    DUPE: 807e1c0c (phone 3616088513, no email, 1 policy)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '3f3a0d26-16af-48b1-b069-480791a9c534', "updatedAt" = NOW()
  WHERE "leadId" = '807e1c0c-b7fa-4a41-8aff-cb996a0950a2' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '3f3a0d26-16af-48b1-b069-480791a9c534', "updatedAt" = NOW()
  WHERE "leadId" = '807e1c0c-b7fa-4a41-8aff-cb996a0950a2' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '3f3a0d26-16af-48b1-b069-480791a9c534', "updatedAt" = NOW()
  WHERE "leadId" = '807e1c0c-b7fa-4a41-8aff-cb996a0950a2' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = '807e1c0c-b7fa-4a41-8aff-cb996a0950a2' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Randell Forge
--    KEEP: 9ad8da6c (phone 9324597626, email revforge@gmail.com, 3 policies)
--    DUPE: 2b2a656d (phone 8324597626, no email, 1 policy)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '9ad8da6c-3b53-421d-bc83-b62f4a9530cc', "updatedAt" = NOW()
  WHERE "leadId" = '2b2a656d-1d8c-4abb-9803-3693dfab894b' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '9ad8da6c-3b53-421d-bc83-b62f4a9530cc', "updatedAt" = NOW()
  WHERE "leadId" = '2b2a656d-1d8c-4abb-9803-3693dfab894b' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '9ad8da6c-3b53-421d-bc83-b62f4a9530cc', "updatedAt" = NOW()
  WHERE "leadId" = '2b2a656d-1d8c-4abb-9803-3693dfab894b' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = '2b2a656d-1d8c-4abb-9803-3693dfab894b' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Arianna Jackson
--    KEEP: 8727c082 (phone 8646654333, email aejxoo2005@yahoo.com, 1 policy)
--    DUPE: c8558b7b (phone 8646654330, no email, 1 policy, 1 call)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '8727c082-95e2-4ec9-94f5-2c4cd77bdc1f', "updatedAt" = NOW()
  WHERE "leadId" = 'c8558b7b-0449-4f0c-ad4d-e595bb8e6f6c' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '8727c082-95e2-4ec9-94f5-2c4cd77bdc1f', "updatedAt" = NOW()
  WHERE "leadId" = 'c8558b7b-0449-4f0c-ad4d-e595bb8e6f6c' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '8727c082-95e2-4ec9-94f5-2c4cd77bdc1f', "updatedAt" = NOW()
  WHERE "leadId" = 'c8558b7b-0449-4f0c-ad4d-e595bb8e6f6c' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = 'c8558b7b-0449-4f0c-ad4d-e595bb8e6f6c' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. William Mckinley
--    KEEP: 9692da12 (phone 8066736623, 3 policies)
--    DUPE: d685a6ea (phone 8066766623, email billmckinley70@gmail.com, 1 policy)
--    → also copy email to keeper (keeper has williamm@gmail.com which is generic)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '9692da12-5f6c-4524-8856-2e898928fda6', "updatedAt" = NOW()
  WHERE "leadId" = 'd685a6ea-8246-47c2-89b0-3822957f654d' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '9692da12-5f6c-4524-8856-2e898928fda6', "updatedAt" = NOW()
  WHERE "leadId" = 'd685a6ea-8246-47c2-89b0-3822957f654d' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '9692da12-5f6c-4524-8856-2e898928fda6', "updatedAt" = NOW()
  WHERE "leadId" = 'd685a6ea-8246-47c2-89b0-3822957f654d' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = 'd685a6ea-8246-47c2-89b0-3822957f654d' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Kristina Mosley
--    KEEP: c0773bdc (phone 2513013752, email kisha2hotboo@gmail.com, 2 policies, 1 call)
--    DUPE: 8404e702 (phone 2513013751, no email, 0 policies, 0 calls)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = 'c0773bdc-d819-4efb-a4e8-41a265d26416', "updatedAt" = NOW()
  WHERE "leadId" = '8404e702-1e62-40ce-87ce-6bb7675a9ed6' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = 'c0773bdc-d819-4efb-a4e8-41a265d26416', "updatedAt" = NOW()
  WHERE "leadId" = '8404e702-1e62-40ce-87ce-6bb7675a9ed6' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = 'c0773bdc-d819-4efb-a4e8-41a265d26416', "updatedAt" = NOW()
  WHERE "leadId" = '8404e702-1e62-40ce-87ce-6bb7675a9ed6' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = '8404e702-1e62-40ce-87ce-6bb7675a9ed6' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Teresa Rudnick
--    KEEP: 6730003a (phone 2546692715, email trudnickmr@gmail.com, 4 policies)
--    DUPE: 61d340b8 (phone 2546692175, email teresarudnick2025@gmail.com, 2 policies)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '6730003a-89e1-4999-a2fe-f1caf46bb26c', "updatedAt" = NOW()
  WHERE "leadId" = '61d340b8-a336-4828-a015-c2a81c26c150' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '6730003a-89e1-4999-a2fe-f1caf46bb26c', "updatedAt" = NOW()
  WHERE "leadId" = '61d340b8-a336-4828-a015-c2a81c26c150' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '6730003a-89e1-4999-a2fe-f1caf46bb26c', "updatedAt" = NOW()
  WHERE "leadId" = '61d340b8-a336-4828-a015-c2a81c26c150' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = '61d340b8-a336-4828-a015-c2a81c26c150' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. Olivia Washington
--    KEEP: 0e331ad2 (phone 2515036112, email washingtonolivia234@gmail.com, 2 policies)
--    DUPE: bcece04b (phone 2515036113, no email, 1 policy)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '0e331ad2-3aaa-4d3a-a61c-0af54f533884', "updatedAt" = NOW()
  WHERE "leadId" = 'bcece04b-43b9-4df4-b869-cad0d4874fac' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '0e331ad2-3aaa-4d3a-a61c-0af54f533884', "updatedAt" = NOW()
  WHERE "leadId" = 'bcece04b-43b9-4df4-b869-cad0d4874fac' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '0e331ad2-3aaa-4d3a-a61c-0af54f533884', "updatedAt" = NOW()
  WHERE "leadId" = 'bcece04b-43b9-4df4-b869-cad0d4874fac' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = 'bcece04b-43b9-4df4-b869-cad0d4874fac' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. Kara Coone (truncated phone: 386389 vs 3863891462)
--     KEEP: ac77a6ab (phone 3863891462, email karacoone@gmail.com, 1 policy)
--     DUPE: 4cce42fd (phone 386389 [truncated], no email, 1 policy)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = 'ac77a6ab-2014-4a13-b05d-3882795ee73c', "updatedAt" = NOW()
  WHERE "leadId" = '4cce42fd-3860-47a6-b9d7-d5bc5d2989e5' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = 'ac77a6ab-2014-4a13-b05d-3882795ee73c', "updatedAt" = NOW()
  WHERE "leadId" = '4cce42fd-3860-47a6-b9d7-d5bc5d2989e5' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = 'ac77a6ab-2014-4a13-b05d-3882795ee73c', "updatedAt" = NOW()
  WHERE "leadId" = '4cce42fd-3860-47a6-b9d7-d5bc5d2989e5' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = '4cce42fd-3860-47a6-b9d7-d5bc5d2989e5' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. Jeremie Grant (similar emails: jeremiegrant31 vs jeremiegrant3)
--     KEEP: 06dc9354 (phone 2149951808, email jeremiegrant31@gmail.com, 1 policy)
--     DUPE: da6c8e38 (phone 2143929801, email jeremiegrant3@gmail.com, 1 policy)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '06dc9354-ef4c-4daa-923d-0a8b77d15444', "updatedAt" = NOW()
  WHERE "leadId" = 'da6c8e38-1d64-4251-b7ff-5d8465240c1e' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '06dc9354-ef4c-4daa-923d-0a8b77d15444', "updatedAt" = NOW()
  WHERE "leadId" = 'da6c8e38-1d64-4251-b7ff-5d8465240c1e' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '06dc9354-ef4c-4daa-923d-0a8b77d15444', "updatedAt" = NOW()
  WHERE "leadId" = 'da6c8e38-1d64-4251-b7ff-5d8465240c1e' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = 'da6c8e38-1d64-4251-b7ff-5d8465240c1e' AND "deletedAt" IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. Margarita Mora (similar emails: maguimora34 vs maguimora39)
--     KEEP: 92994567 (phone 8175699209, email maguimora39@gmail.com, 2 policies)
--     DUPE: adf8a0b7 (phone 8174155233, email maguimora34@gmail.com, 1 policy, 1 call)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE "_policy" SET "leadId" = '92994567-57fe-4abb-8556-b55c7b5de7a0', "updatedAt" = NOW()
  WHERE "leadId" = 'adf8a0b7-6c8a-4a96-be20-8d82f683478c' AND "deletedAt" IS NULL;
UPDATE "_call" SET "leadId" = '92994567-57fe-4abb-8556-b55c7b5de7a0', "updatedAt" = NOW()
  WHERE "leadId" = 'adf8a0b7-6c8a-4a96-be20-8d82f683478c' AND "deletedAt" IS NULL;
UPDATE "_familyMember" SET "leadId" = '92994567-57fe-4abb-8556-b55c7b5de7a0', "updatedAt" = NOW()
  WHERE "leadId" = 'adf8a0b7-6c8a-4a96-be20-8d82f683478c' AND "deletedAt" IS NULL;
UPDATE person SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE id = 'adf8a0b7-6c8a-4a96-be20-8d82f683478c' AND "deletedAt" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

-- Should show 12 soft-deleted duplicates
SELECT 'deleted_dupes' AS check_name, COUNT(*) AS cnt
FROM person
WHERE id IN (
  '383a431b-7ce7-4ead-90cc-6ac93d0947d0',
  '089b680e-d704-4295-8b67-a86d67e8e2b5',
  '807e1c0c-b7fa-4a41-8aff-cb996a0950a2',
  '2b2a656d-1d8c-4abb-9803-3693dfab894b',
  'c8558b7b-0449-4f0c-ad4d-e595bb8e6f6c',
  'd685a6ea-8246-47c2-89b0-3822957f654d',
  '8404e702-1e62-40ce-87ce-6bb7675a9ed6',
  '61d340b8-a336-4828-a015-c2a81c26c150',
  'bcece04b-43b9-4df4-b869-cad0d4874fac',
  '4cce42fd-3860-47a6-b9d7-d5bc5d2989e5',
  'da6c8e38-1d64-4251-b7ff-5d8465240c1e',
  'adf8a0b7-6c8a-4a96-be20-8d82f683478c'
) AND "deletedAt" IS NOT NULL;

-- Should show 0 policies pointing to deleted leads (minus the 2 known unresolvable orphans)
SELECT 'orphaned_policies' AS check_name, COUNT(*) AS cnt
FROM "_policy" p
WHERE p."deletedAt" IS NULL
  AND (p."leadId" IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM person per
      WHERE per.id = p."leadId" AND per."deletedAt" IS NULL
    ));

-- Re-run near-match duplicate check — should return 0
WITH name_dupes AS (
  SELECT "nameFirstName", "nameLastName",
         id, "phonesPrimaryPhoneNumber"
  FROM person
  WHERE "nameFirstName" IS NOT NULL AND "nameFirstName" != ''
    AND "nameLastName" IS NOT NULL AND "nameLastName" != ''
    AND "phonesPrimaryPhoneNumber" IS NOT NULL AND "phonesPrimaryPhoneNumber" != ''
    AND "deletedAt" IS NULL
),
pairs AS (
  SELECT a.id AS id_a, b.id AS id_b,
    CASE WHEN length(a."phonesPrimaryPhoneNumber") = length(b."phonesPrimaryPhoneNumber")
      THEN (
        SELECT COUNT(*) FROM generate_series(1, length(a."phonesPrimaryPhoneNumber")) i
        WHERE substr(a."phonesPrimaryPhoneNumber", i, 1) != substr(b."phonesPrimaryPhoneNumber", i, 1)
      )
      ELSE abs(length(a."phonesPrimaryPhoneNumber") - length(b."phonesPrimaryPhoneNumber")) + 10
    END AS phone_diff
  FROM name_dupes a
  JOIN name_dupes b ON a."nameFirstName" = b."nameFirstName"
    AND a."nameLastName" = b."nameLastName"
    AND a.id < b.id
)
SELECT 'remaining_near_dupes' AS check_name, COUNT(*) AS cnt
FROM pairs WHERE phone_diff <= 2;

COMMIT;
