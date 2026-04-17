-- Layout migration: Company (account) detail view (2026-03-26)
--
-- Desired state:
--   General    (pos 0): domainName, legalName, clientCategory, subType, clientRank, source, accountOwner
--   Additional (pos 1): people, opportunities, originatedOpportunities, arrangedDeals,
--                       associatedDeals, inAccountGroup, desks, targettedByCampaign
--   Other      (pos 2): linkedinLink, address, createdAt, createdBy
--
-- Inactive fields (annualRecurringRevenue / ARR, xLink / X) must NOT be in any group.
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
  SELECT id INTO v_obj FROM core."objectMetadata" WHERE "nameSingular" = 'company';

  IF v_obj IS NULL THEN
    RAISE EXCEPTION 'objectMetadata row for "company" not found';
  END IF;

  -- Locate the FIELDS widget view on the Home tab
  SELECT (pw.configuration->>'viewId')::UUID INTO v_view
  FROM core."pageLayout" pl
  JOIN core."objectMetadata" om  ON om.id  = pl."objectMetadataId"
  JOIN core."pageLayoutTab" plt  ON plt."pageLayoutId" = pl.id
  JOIN core."pageLayoutWidget" pw ON pw."pageLayoutTabId" = plt.id
  WHERE om."nameSingular" = 'company'
    AND plt.title = 'Home'
    AND pw.type   = 'FIELDS';

  IF v_view IS NULL THEN
    RAISE EXCEPTION 'Could not find FIELDS widget view for company Home tab';
  END IF;

  RAISE NOTICE 'company FIELDS view: %', v_view;

  -- Ensure the three groups exist
  FOR r IN
    SELECT grp_name, pos FROM (VALUES
      ('General',   0),
      ('Additional',1),
      ('Other',     2)
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

  -- Remove inactive fields from the view (hard-delete viewField rows for inactive fieldMetadata)
  FOR r IN
    SELECT vf.id AS vf_id, fm.name AS fname
    FROM core."viewField" vf
    JOIN core."viewFieldGroup" vfg ON vfg.id = vf."viewFieldGroupId"
    JOIN core."fieldMetadata" fm   ON fm.id  = vf."fieldMetadataId"
    WHERE vfg."viewId"     = v_view
      AND vf."deletedAt" IS NULL
      AND fm."isActive"    = false
  LOOP
    DELETE FROM core."viewField" WHERE id = r.vf_id;
    RAISE NOTICE '[removed inactive] %', r.fname;
  END LOOP;

  -- Assign each field to its target group
  FOR r IN
    SELECT fname, grp_name, pos FROM (VALUES
      ('domainName',                'General',    0),
      ('legalName',                 'General',    1),
      ('clientCategory',            'General',    2),
      ('subType',                   'General',    3),
      ('clientRank',                'General',    4),
      ('source',                    'General',    5),
      ('accountOwner',              'General',    6),
      ('people',                    'Additional', 0),
      ('opportunities',             'Additional', 1),
      ('originatedOpportunities',   'Additional', 2),
      ('arrangedDeals',             'Additional', 3),
      ('associatedDeals',           'Additional', 4),
      ('inAccountGroup',            'Additional', 5),
      ('desks',                     'Additional', 6),
      ('targettedByCampaign',       'Additional', 7),
      ('linkedinLink',              'Other',      0),
      ('address',                   'Other',      1),
      ('createdAt',                 'Other',      2),
      ('createdBy',                 'Other',      3)
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

    IF EXISTS (
      SELECT 1 FROM core."viewField"
      WHERE "viewFieldGroupId" = v_grp
        AND "fieldMetadataId"  = v_fid
        AND "deletedAt" IS NULL
    ) THEN
      RAISE NOTICE '[ok] % already in %', r.fname, r.grp_name;
      CONTINUE;
    END IF;

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

    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       v_fid, true, 0, r.pos,
       v_view, v_grp, v_ws, v_app, now(), now());
    RAISE NOTICE '[added] % → %', r.fname, r.grp_name;
  END LOOP;

  -- Remove all FIELD card widgets from the Home tab
  DELETE FROM core."pageLayoutWidget"
  WHERE type = 'FIELD'
    AND "pageLayoutTabId" IN (
      SELECT plt.id
      FROM core."pageLayoutTab" plt
      JOIN core."pageLayout" pl   ON pl.id  = plt."pageLayoutId"
      JOIN core."objectMetadata" om ON om.id = pl."objectMetadataId"
      WHERE om."nameSingular" = 'company'
        AND plt.title = 'Home'
    );
  RAISE NOTICE '[deleted] FIELD card widgets from company Home tab';

END $$;
