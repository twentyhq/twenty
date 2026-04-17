-- Layout migration: Opportunity detail view (2026-03-26)
--
-- Desired state:
--   General     (pos 0): closeDate, stage, company, dealSource, currencyCustom, totalFeeRollup, tags
--   Additional  (pos 1): pointOfContact, owner, arranger, originator
--   Other       (pos 2): createdAt, createdBy
--   Risk and Compliance (pos 3): jurisdictionsInvolved, riskAssessment, riskAssessmentResult,
--                                riskCommitteeDecision, riskCommitteeDecisionNotes, lossReason, lossNotes
--
-- All FIELD card widgets on the Home tab are removed.
--
-- Idempotent: safe to run multiple times.

DO $$
DECLARE
  v_ws   UUID;
  v_app  UUID;
  v_obj  UUID;
  v_view UUID;
  v_grp  UUID;
  v_fid  UUID;
  r      RECORD;
BEGIN
  SELECT id INTO v_ws  FROM core.workspace LIMIT 1;
  SELECT id INTO v_app FROM core.application WHERE "workspaceId" = v_ws LIMIT 1;
  SELECT id INTO v_obj FROM core."objectMetadata" WHERE "nameSingular" = 'opportunity';

  IF v_obj IS NULL THEN
    RAISE EXCEPTION 'objectMetadata row for "opportunity" not found';
  END IF;

  -- Locate the FIELDS widget view on the Home tab
  SELECT (pw.configuration->>'viewId')::UUID INTO v_view
  FROM core."pageLayout" pl
  JOIN core."objectMetadata" om  ON om.id  = pl."objectMetadataId"
  JOIN core."pageLayoutTab" plt  ON plt."pageLayoutId" = pl.id
  JOIN core."pageLayoutWidget" pw ON pw."pageLayoutTabId" = plt.id
  WHERE om."nameSingular" = 'opportunity'
    AND plt.title = 'Home'
    AND pw.type   = 'FIELDS';

  IF v_view IS NULL THEN
    RAISE EXCEPTION 'Could not find FIELDS widget view for opportunity Home tab';
  END IF;

  RAISE NOTICE 'opportunity FIELDS view: %', v_view;

  -- Ensure all four groups exist (create if missing, skip if present)
  FOR r IN
    SELECT grp_name, pos FROM (VALUES
      ('General',            0),
      ('Additional',         1),
      ('Other',              2),
      ('Risk and Compliance',3)
    ) AS t(grp_name, pos)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM core."viewFieldGroup" WHERE "viewId" = v_view AND name = r.grp_name
    ) THEN
      INSERT INTO core."viewFieldGroup"
        ("universalIdentifier","id","name","position","isVisible",
         "viewId","workspaceId","applicationId","createdAt","updatedAt")
      VALUES
        (gen_random_uuid(), gen_random_uuid(),
         r.grp_name, r.pos, true,
         v_view, v_ws, v_app, now(), now());
      RAISE NOTICE '[created group] %', r.grp_name;
    ELSE
      RAISE NOTICE '[group ok] %', r.grp_name;
    END IF;
  END LOOP;

  -- Assign each field to its target group.
  -- Logic per field:
  --   1. If already in target group → skip (idempotent)
  --   2. If in another group in this view → move (UPDATE viewFieldGroupId + position)
  --   3. Otherwise → INSERT into target group
  FOR r IN
    SELECT fname, grp_name, pos FROM (VALUES
      ('closeDate',                   'General',            0),
      ('stage',                       'General',            1),
      ('company',                     'General',            2),
      ('dealSource',                  'General',            3),
      ('currencyCustom',              'General',            4),
      ('totalFeeRollup',              'General',            5),
      ('tags',                        'General',            6),
      ('pointOfContact',              'Additional',         0),
      ('owner',                       'Additional',         1),
      ('arranger',                    'Additional',         2),
      ('originator',                  'Additional',         3),
      ('createdAt',                   'Other',              0),
      ('createdBy',                   'Other',              1),
      ('jurisdictionsInvolved',       'Risk and Compliance',0),
      ('riskAssessment',              'Risk and Compliance',1),
      ('riskAssessmentResult',        'Risk and Compliance',2),
      ('riskCommitteeDecision',       'Risk and Compliance',3),
      ('riskCommitteeDecisionNotes',  'Risk and Compliance',4),
      ('lossReason',                  'Risk and Compliance',5),
      ('lossNotes',                   'Risk and Compliance',6)
    ) AS t(fname, grp_name, pos)
  LOOP
    SELECT id INTO v_fid FROM core."fieldMetadata"
      WHERE "objectMetadataId" = v_obj AND name = r.fname;
    IF v_fid IS NULL THEN
      RAISE NOTICE '[skip] field % not found on this environment', r.fname;
      CONTINUE;
    END IF;

    SELECT id INTO v_grp FROM core."viewFieldGroup"
      WHERE "viewId" = v_view AND name = r.grp_name;

    -- Already in target group?
    IF EXISTS (
      SELECT 1 FROM core."viewField"
      WHERE "viewFieldGroupId" = v_grp
        AND "fieldMetadataId"  = v_fid
        AND "deletedAt" IS NULL
    ) THEN
      RAISE NOTICE '[ok] % already in %', r.fname, r.grp_name;
      CONTINUE;
    END IF;

    -- In another group in this view? Move it.
    UPDATE core."viewField" vf
    SET "viewFieldGroupId" = v_grp,
        position           = r.pos
    FROM core."viewFieldGroup" vfg
    WHERE vfg.id             = vf."viewFieldGroupId"
      AND vfg."viewId"       = v_view
      AND vf."fieldMetadataId" = v_fid
      AND vf."deletedAt" IS NULL;

    IF FOUND THEN
      RAISE NOTICE '[moved] % → %', r.fname, r.grp_name;
      CONTINUE;
    END IF;

    -- Insert fresh
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       v_fid, true, 0, r.pos,
       v_view, v_grp, v_ws, v_app, now(), now());
    RAISE NOTICE '[added] % → %', r.fname, r.grp_name;
  END LOOP;

  -- Remove all FIELD card widgets from the Home tab (idempotent — no-op if already deleted)
  DELETE FROM core."pageLayoutWidget"
  WHERE type = 'FIELD'
    AND "pageLayoutTabId" IN (
      SELECT plt.id
      FROM core."pageLayoutTab" plt
      JOIN core."pageLayout" pl   ON pl.id  = plt."pageLayoutId"
      JOIN core."objectMetadata" om ON om.id = pl."objectMetadataId"
      WHERE om."nameSingular" = 'opportunity'
        AND plt.title = 'Home'
    );
  RAISE NOTICE '[deleted] FIELD card widgets from opportunity Home tab (% rows)', FOUND::int;

END $$;
