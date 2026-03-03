-- =============================================================================
-- Fix Orphaned Policies (no leadId or leadId points to deleted person)
-- =============================================================================
-- Cross-referenced against Lead-policy-28022026.csv export to match
-- policy numbers to customers, then linked to existing person records
-- via phone number.
--
-- Run after dedup-leads-by-phone.sql and dedup-leads-by-name.sql
-- =============================================================================

SET search_path TO workspace_oyoiha4z71ppw867jthfb36d;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 1: CSV-matched policies (18 policies matched by policy number → phone)
-- ─────────────────────────────────────────────────────────────────────────────

-- 5395254501 = Bonnie Parker
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '5395254501' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '7753257045' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 8507259795 = Timothy Munn (leadId pointed to deleted person)
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '8507259795' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '7854977552' AND "deletedAt" IS NULL AND ("leadId" IS NULL OR "leadId" IN (SELECT id FROM person WHERE "deletedAt" IS NOT NULL));

-- 5045280342 = Kyra Moore
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '5045280342' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '7214245105' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 9545481884 = Colin Roseau
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '9545481884' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '7857746337' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 9313154366 = Robert Branson/Braston
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '9313154366' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '7881322223' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 9317975511 = Jason Proctor
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '9317975511' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '7234242430' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 7854103454 = Natalie Maysonet
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '7854103454' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '7184949732' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 8329842657 = Jerry Russell
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '8329842657' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '450894167' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 5733474899 = Travis Caraway
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '5733474899' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '13549177301' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 9794790910 = Jessica Centeno
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '9794790910' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '13549229501' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 6155688276 = Gregory Buckner
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '6155688276' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '450869743' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 8166464116 = Robert Tipton (leadId pointed to deleted person)
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '8166464116' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = 'OSC78113407-01' AND "deletedAt" IS NULL;

-- 7692984382 = April Ford
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '7692984382' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '450761724' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 3215078965 = Michael Stanton
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '3215078965' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = 'UZ1767158' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 3345574958 = Jerome Henderson
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '3345574958' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = 'U73505844' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 8122648612 = Tracy Martin
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '8122648612' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '450681106' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 8647725849 = Amanda Sanders
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '8647725849' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = 'U70558908' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 2102545491 = Lorraine Pastrano
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '2102545491' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = '13115724001' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 2: Manually investigated orphans (2 more fixed)
-- ─────────────────────────────────────────────────────────────────────────────

-- OSC75574725: Oscar ACA Bronze. Not in CSV but close match OSC75574120-01
-- is Wilmen Weno-Goforth (8178796667). Same agent's other policies confirm.
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '8178796667' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE "policyNumber" = 'OSC75574725' AND "leadId" IS NULL AND "deletedAt" IS NULL;

-- 02d85834 (no policy number): Ambetter Major Medical, old CRM import.
-- oldCrmPolicyId 0dbcf39d... maps to Nathan Coffey (8282665713) in CSV.
-- Original "Anita Burton" lead was a ghost (no phone/email, created+deleted same day).
UPDATE "_policy" SET "leadId" = (SELECT id FROM person WHERE "phonesPrimaryPhoneNumber" = '8282665713' AND "deletedAt" IS NULL LIMIT 1), "updatedAt" = NOW() WHERE id = '02d85834-ebbd-41bd-848d-702b38cd8abb' AND "deletedAt" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 3: Unresolvable orphans (2 remaining — manual review needed)
-- ─────────────────────────────────────────────────────────────────────────────

-- 7242291036: UHC Unknown product, no match in CSV, no phone/name clues.
--   Agent (8f6b4032) has no workspace member record. Submitted 2/25.
--   Likely needs manual resolution by asking the team.

-- be80a4e5 (no policy number): Ambetter Unknown, created manually by Dawn Adams
--   on 2/27. Points to ghost lead 5979fad1 (empty: no name, phone, email).
--   Likely an accidental/incomplete entry.

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'remaining_orphans' AS check_name, COUNT(*) AS cnt
FROM "_policy" p
WHERE p."deletedAt" IS NULL
  AND (p."leadId" IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM person per
      WHERE per.id = p."leadId" AND per."deletedAt" IS NULL
    ));
