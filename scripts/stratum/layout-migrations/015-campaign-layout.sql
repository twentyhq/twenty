-- Layout migration 015 — Campaign record detail layout.
--
-- Creates field groups and populates the Home tab's FIELDS widget with all
-- custom Campaign fields. Depends on metadata migration 020-campaigns having
-- been applied (creates the campaign object and all referenced fields).
--
-- Groups (top to bottom):
--   0. Overview         — code, status, typeCustom, owner, description
--   1. Schedule         — startDate, endDate
--   2. Goals and Budget — budgetedCost, actualCost, targetMeetings, targetOpportunities, targetRevenue
--   3. Task generation  — taskTitleTemplate, taskDueDaysFromStart, defaultAssignee
--   4. Hierarchy        — parentCampaign
--
-- Reverse ONE_TO_MANY relations (members, subCampaigns, sourcedOpportunities)
-- intentionally excluded — they render as relation chip-lists elsewhere, not
-- as single-value fields in groups.
--
-- Idempotent: re-running is safe. Groups and viewFields are only created if
-- they don't already exist.

DO $$
DECLARE
  v_workspace_id UUID;
  v_app_id       UUID;
  v_obj_id       UUID;
  v_view_id      UUID;

  v_group_overview     UUID;
  v_group_schedule     UUID;
  v_group_goals        UUID;
  v_group_task_gen     UUID;
  v_group_hierarchy    UUID;

  v_field_id UUID;
BEGIN
  -- Resolve workspace / application
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;
  SELECT id INTO v_app_id FROM core.application
    WHERE "workspaceId" = v_workspace_id LIMIT 1;

  -- Resolve campaign object
  SELECT id INTO v_obj_id FROM core."objectMetadata"
    WHERE "nameSingular" = 'campaign';
  IF v_obj_id IS NULL THEN
    RAISE EXCEPTION 'campaign object not found — run metadata migration 020-campaigns first';
  END IF;

  -- Resolve the FIELDS widget view on the Home tab
  SELECT (pw.configuration->>'viewId')::UUID INTO v_view_id
  FROM core."pageLayout" pl
  JOIN core."pageLayoutTab" plt ON plt."pageLayoutId" = pl.id
  JOIN core."pageLayoutWidget" pw ON pw."pageLayoutTabId" = plt.id
  WHERE pl."objectMetadataId" = v_obj_id
    AND plt.title = 'Home'
    AND pw.type = 'FIELDS';
  IF v_view_id IS NULL THEN
    RAISE EXCEPTION 'campaign Home FIELDS widget not found';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- Groups (idempotent: create only if missing)
  -- ─────────────────────────────────────────────────────────────────────────

  SELECT id INTO v_group_overview FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Overview';
  IF v_group_overview IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Overview', 0, true,
       v_view_id, v_workspace_id, v_app_id, now(), now())
    RETURNING id INTO v_group_overview;
    RAISE NOTICE 'Created group: Overview → %', v_group_overview;
  END IF;

  SELECT id INTO v_group_schedule FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Schedule';
  IF v_group_schedule IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Schedule', 1, true,
       v_view_id, v_workspace_id, v_app_id, now(), now())
    RETURNING id INTO v_group_schedule;
    RAISE NOTICE 'Created group: Schedule → %', v_group_schedule;
  END IF;

  SELECT id INTO v_group_goals FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Goals and Budget';
  IF v_group_goals IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Goals and Budget', 2, true,
       v_view_id, v_workspace_id, v_app_id, now(), now())
    RETURNING id INTO v_group_goals;
    RAISE NOTICE 'Created group: Goals and Budget → %', v_group_goals;
  END IF;

  SELECT id INTO v_group_task_gen FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Task generation';
  IF v_group_task_gen IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Task generation', 3, true,
       v_view_id, v_workspace_id, v_app_id, now(), now())
    RETURNING id INTO v_group_task_gen;
    RAISE NOTICE 'Created group: Task generation → %', v_group_task_gen;
  END IF;

  SELECT id INTO v_group_hierarchy FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Hierarchy';
  IF v_group_hierarchy IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Hierarchy', 4, true,
       v_view_id, v_workspace_id, v_app_id, now(), now())
    RETURNING id INTO v_group_hierarchy;
    RAISE NOTICE 'Created group: Hierarchy → %', v_group_hierarchy;
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- Fields per group (idempotent: insert only if not already present)
  -- ─────────────────────────────────────────────────────────────────────────

  -- ---- Overview group: code(0), status(1), typeCustom(2), owner(3), description(4) ----
  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'code';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_overview AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 0, v_view_id, v_group_overview, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'status';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_overview AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 1, v_view_id, v_group_overview, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'typeCustom';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_overview AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 2, v_view_id, v_group_overview, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'owner';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_overview AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 3, v_view_id, v_group_overview, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'description';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_overview AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 4, v_view_id, v_group_overview, v_workspace_id, v_app_id, now(), now());
  END IF;

  -- ---- Schedule group ----
  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'startDate';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_schedule AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 0, v_view_id, v_group_schedule, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'endDate';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_schedule AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 1, v_view_id, v_group_schedule, v_workspace_id, v_app_id, now(), now());
  END IF;

  -- ---- Goals and Budget group ----
  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'budgetedCost';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_goals AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 0, v_view_id, v_group_goals, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'actualCost';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_goals AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 1, v_view_id, v_group_goals, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'targetMeetings';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_goals AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 2, v_view_id, v_group_goals, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'targetOpportunities';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_goals AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 3, v_view_id, v_group_goals, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'targetRevenue';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_goals AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 4, v_view_id, v_group_goals, v_workspace_id, v_app_id, now(), now());
  END IF;

  -- ---- Task generation group ----
  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'taskTitleTemplate';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_task_gen AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 0, v_view_id, v_group_task_gen, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'taskDueDaysFromStart';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_task_gen AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 1, v_view_id, v_group_task_gen, v_workspace_id, v_app_id, now(), now());
  END IF;

  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'defaultAssignee';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_task_gen AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 2, v_view_id, v_group_task_gen, v_workspace_id, v_app_id, now(), now());
  END IF;

  -- ---- Hierarchy group ----
  SELECT id INTO v_field_id FROM core."fieldMetadata" WHERE "objectMetadataId" = v_obj_id AND name = 'parentCampaign';
  IF v_field_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM core."viewField" WHERE "viewFieldGroupId" = v_group_hierarchy AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL) THEN
    INSERT INTO core."viewField" ("universalIdentifier","id","fieldMetadataId","isVisible","size","position","viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 0, v_view_id, v_group_hierarchy, v_workspace_id, v_app_id, now(), now());
  END IF;

  RAISE NOTICE 'Campaign layout migration complete';
END $$;
