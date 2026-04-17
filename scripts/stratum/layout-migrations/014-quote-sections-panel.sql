-- Migration 014: Wire the Quote Sections front component into the Default Quote Layout.
--
-- The "Default Quote Layout" already has an empty "Sections" tab (position 15).
-- This script inserts a FRONT_COMPONENT widget into that tab, pointing to the
-- quote-sections-panel front component by its stable universalIdentifier.
--
-- The frontComponent DB id changes on every app reinstall, so this script
-- does a DELETE + INSERT to always use the current id. It is safe to re-run.
--
-- Run after every reinstall of the Stratum Quote UI app:
--   railway ssh --service twenty --environment uat -- \
--     "printf '%s' '<B64>' | base64 -d | psql \"$PG_DATABASE_URL\""

DO $$
DECLARE
  v_tab_id         UUID := '5e7e9059-f69b-413a-82e4-cd6de6cefc24';
  v_fc_uid         UUID := 'd0b86e0f-d6e1-4df3-ae8a-87fc1c2292fa';
  v_workspace_id   UUID := '8b36bd60-ed50-4630-9a45-8b0286fc6106';
  -- Workspace's custom application — widget owned here so it survives app reinstalls
  v_app_id         UUID := 'f42d44ad-d5cc-4248-b995-25412c54f0e2';
  v_fc_id          UUID;
  v_widget_id      UUID;
  v_widget_uid     UUID;
BEGIN
  -- Look up current frontComponent id by stable universalIdentifier
  SELECT id INTO v_fc_id
  FROM core."frontComponent"
  WHERE "universalIdentifier" = v_fc_uid;

  IF v_fc_id IS NULL THEN
    RAISE NOTICE 'frontComponent % not found — is the Stratum Quote UI app installed?', v_fc_uid;
    RETURN;
  END IF;

  -- Remove any existing FRONT_COMPONENT widget in this tab
  -- (handles the case where the old widget has an outdated frontComponentId)
  DELETE FROM core."pageLayoutWidget"
  WHERE "pageLayoutTabId" = v_tab_id
    AND type = 'FRONT_COMPONENT';

  -- Insert fresh widget with current frontComponentId
  v_widget_id  := gen_random_uuid();
  v_widget_uid := gen_random_uuid();

  INSERT INTO core."pageLayoutWidget" (
    id, "universalIdentifier", title, type,
    configuration, "gridPosition",
    "pageLayoutTabId", "workspaceId", "applicationId",
    "createdAt", "updatedAt"
  ) VALUES (
    v_widget_id,
    v_widget_uid,
    'Quote Sections',
    'FRONT_COMPONENT',
    jsonb_build_object(
      'configurationType', 'FRONT_COMPONENT',
      'frontComponentId', v_fc_id
    ),
    '{"row": 0, "column": 0, "rowSpan": 1, "columnSpan": 1}'::jsonb,
    v_tab_id,
    v_workspace_id,
    v_app_id,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Inserted FRONT_COMPONENT widget % → frontComponent %', v_widget_id, v_fc_id;
END $$;
