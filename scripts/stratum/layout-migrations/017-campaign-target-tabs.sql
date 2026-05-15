-- Layout migration 017 — Campaign Targets tabs.
--
-- Depends on:
--   * metadata migration 020-campaigns (creates campaign + campaignMember)
--   * stratum-campaigns-app deployed AND installed (registers
--     `campaign-people-targets` and `campaign-company-targets` front
--     components with known universalIdentifiers).
--
-- What this migration does:
--   1. Remove the legacy `members` FIELD CARD widget from the Home tab
--      (added by 016). Targets now live on dedicated tabs, so the home
--      card is redundant.
--   2. Create two new tabs on the campaign page layout:
--        - "People"    (position 1, IconUser)
--        - "Companies" (position 2, IconBuilding)
--   3. On each tab, create a single FRONT_COMPONENT widget that points to
--      the matching stratum-campaigns-app front-component (looked up by
--      universalIdentifier — the DB id changes on every app reinstall).
--
-- Why widgets reference `frontComponent.id` and not the manifest UID:
--   `pageLayoutWidget.configuration.frontComponentUniversalIdentifier`
--   carries the manifest UID — but the runtime FRONT_COMPONENT renderer
--   resolves it through the `frontComponent` table on each request. The
--   stable manifest UID is therefore enough; we don't need to store the
--   per-install `frontComponent.id` anywhere else.
--
-- Why the widget's applicationId is taken from the existing Home tab:
--   The skill (deploy-twenty-app) warns that if a widget's applicationId
--   matches the SDK app's own application row, uninstalling the app
--   cascade-deletes the widget. We anchor to the Home tab's app — that
--   tab predates this app, so its applicationId is stable across our
--   reinstalls.
--
-- Idempotent: re-running is safe. After every stratum-campaigns-app
-- redeploy + reinstall, re-run this migration to repoint widgets at the
-- new frontComponent DB ids, then flush the flat entity cache.

DO $$
DECLARE
  v_workspace_id       UUID;
  v_obj_id             UUID;
  v_page_layout_id     UUID;
  v_home_tab_id        UUID;
  v_home_app_id        UUID;

  v_members_field_id   UUID;
  v_legacy_widget_id   UUID;

  v_people_tab_id      UUID;
  v_company_tab_id     UUID;
  v_max_position       FLOAT;

  v_people_fc_id       UUID;
  v_company_fc_id      UUID;

  -- Manifest UIDs from apps/stratum-campaigns-app/src/constants/universal-identifiers.ts
  C_PEOPLE_FC_UID  CONSTANT UUID := '80b9c490-fda9-4b86-88a2-5d6470155ae8';
  C_COMPANY_FC_UID CONSTANT UUID := '28f06e42-a0a3-48a1-8452-58da452735af';
BEGIN
  -- ── 1. Resolve workspace / campaign object / page layout / Home tab ──────
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;

  SELECT id INTO v_obj_id FROM core."objectMetadata"
    WHERE "nameSingular" = 'campaign';
  IF v_obj_id IS NULL THEN
    RAISE EXCEPTION 'campaign object not found — run metadata migration 020-campaigns first';
  END IF;

  SELECT pl.id INTO v_page_layout_id FROM core."pageLayout" pl
    WHERE pl."objectMetadataId" = v_obj_id;
  IF v_page_layout_id IS NULL THEN
    RAISE EXCEPTION 'campaign pageLayout not found — Twenty backfill-page-layouts must run first';
  END IF;

  -- Use the Home tab's applicationId as the anchor for the new tabs +
  -- widgets. This avoids tying widgets to the stratum-campaigns-app row
  -- (which would cascade-delete them on uninstall).
  SELECT plt.id, plt."applicationId" INTO v_home_tab_id, v_home_app_id
  FROM core."pageLayoutTab" plt
  WHERE plt."pageLayoutId" = v_page_layout_id AND plt.title = 'Home';
  IF v_home_tab_id IS NULL THEN
    RAISE EXCEPTION 'campaign Home tab not found';
  END IF;
  RAISE NOTICE 'Using Home tab applicationId % as widget anchor', v_home_app_id;

  -- ── 2. Look up the two front components by their manifest UIDs ───────────
  -- core.frontComponent has a UNIQUE index on (workspaceId, universalIdentifier),
  -- so scope by workspaceId in case (theoretically) another workspace
  -- shares the same row in a multi-tenant DB.
  SELECT id INTO v_people_fc_id FROM core."frontComponent"
    WHERE "universalIdentifier" = C_PEOPLE_FC_UID
      AND "workspaceId" = v_workspace_id;
  IF v_people_fc_id IS NULL THEN
    RAISE EXCEPTION 'frontComponent for campaign-people-targets (UID %) not found — install stratum-campaigns-app first', C_PEOPLE_FC_UID;
  END IF;

  SELECT id INTO v_company_fc_id FROM core."frontComponent"
    WHERE "universalIdentifier" = C_COMPANY_FC_UID
      AND "workspaceId" = v_workspace_id;
  IF v_company_fc_id IS NULL THEN
    RAISE EXCEPTION 'frontComponent for campaign-company-targets (UID %) not found — install stratum-campaigns-app first', C_COMPANY_FC_UID;
  END IF;

  RAISE NOTICE 'Resolved frontComponent ids: people=%, company=%', v_people_fc_id, v_company_fc_id;

  -- ── 3. Remove legacy `members` FIELD CARD from Home tab ──────────────────
  SELECT id INTO v_members_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'members';

  IF v_members_field_id IS NOT NULL THEN
    SELECT pw.id INTO v_legacy_widget_id
    FROM core."pageLayoutWidget" pw
    WHERE pw."pageLayoutTabId" = v_home_tab_id
      AND pw.type = 'FIELD'
      AND (pw.configuration->>'fieldMetadataId')::UUID = v_members_field_id;

    IF v_legacy_widget_id IS NOT NULL THEN
      DELETE FROM core."pageLayoutWidget" WHERE id = v_legacy_widget_id;
      RAISE NOTICE 'Removed legacy members FIELD card from Home tab (%)', v_legacy_widget_id;
    ELSE
      RAISE NOTICE 'Legacy members FIELD card already absent — skip';
    END IF;
  END IF;

  -- ── 4. Compute next tab position (skip Home which has position 0) ────────
  SELECT COALESCE(MAX(position), 0) INTO v_max_position
  FROM core."pageLayoutTab"
  WHERE "pageLayoutId" = v_page_layout_id;

  -- ── 5. Create or find the People tab ─────────────────────────────────────
  SELECT id INTO v_people_tab_id FROM core."pageLayoutTab"
    WHERE "pageLayoutId" = v_page_layout_id AND title = 'People';

  IF v_people_tab_id IS NULL THEN
    INSERT INTO core."pageLayoutTab"
      ("universalIdentifier","id","title","position","icon","layoutMode",
       "pageLayoutId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'People', v_max_position + 1, 'IconUser', 'CANVAS',
       v_page_layout_id, v_workspace_id, v_home_app_id, now(), now())
    RETURNING id INTO v_people_tab_id;
    RAISE NOTICE 'Created People tab: %', v_people_tab_id;
  ELSE
    RAISE NOTICE 'People tab already exists: %', v_people_tab_id;
  END IF;

  -- ── 6. Create or find the Companies tab ──────────────────────────────────
  SELECT id INTO v_company_tab_id FROM core."pageLayoutTab"
    WHERE "pageLayoutId" = v_page_layout_id AND title = 'Companies';

  IF v_company_tab_id IS NULL THEN
    INSERT INTO core."pageLayoutTab"
      ("universalIdentifier","id","title","position","icon","layoutMode",
       "pageLayoutId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Companies', v_max_position + 2, 'IconBuilding', 'CANVAS',
       v_page_layout_id, v_workspace_id, v_home_app_id, now(), now())
    RETURNING id INTO v_company_tab_id;
    RAISE NOTICE 'Created Companies tab: %', v_company_tab_id;
  ELSE
    RAISE NOTICE 'Companies tab already exists: %', v_company_tab_id;
  END IF;

  -- ── 7. Replace FRONT_COMPONENT widgets on each tab. The frontComponent
  --      DB id changes on every app reinstall, so we wipe the existing
  --      widget (if any) and re-insert with the current id.
  --      Match by the stable universalIdentifier in configuration.
  -- ─────────────────────────────────────────────────────────────────────────

  -- Each new tab is purpose-built for one front-component widget, so wiping
  -- every FRONT_COMPONENT widget on the tab before re-inserting is safe.
  -- We track which manifest UID is in use via `frontComponentUniversalIdentifier`
  -- in the jsonb configuration (it's ignored by the renderer — which only
  -- reads `frontComponentId` — but it makes the row self-describing for
  -- future audits).
  -- For CANVAS layoutMode, widget position is the canvas shape
  -- `{ layoutMode: 'CANVAS' }` (no row/column/index — see
  -- PageLayoutWidgetCanvasPosition in twenty-shared).

  DELETE FROM core."pageLayoutWidget"
  WHERE "pageLayoutTabId" = v_people_tab_id
    AND type = 'FRONT_COMPONENT';

  INSERT INTO core."pageLayoutWidget"
    ("universalIdentifier","id","title","type","configuration","position","gridPosition",
     "objectMetadataId","pageLayoutTabId","workspaceId","applicationId","createdAt","updatedAt")
  VALUES
    (gen_random_uuid(), gen_random_uuid(),
     'People targets', 'FRONT_COMPONENT',
     jsonb_build_object(
       'configurationType', 'FRONT_COMPONENT',
       'frontComponentUniversalIdentifier', C_PEOPLE_FC_UID::text,
       'frontComponentId', v_people_fc_id::text
     ),
     jsonb_build_object('layoutMode', 'CANVAS'),
     jsonb_build_object('row', 0, 'column', 0, 'rowSpan', 12, 'columnSpan', 12),
     v_obj_id, v_people_tab_id, v_workspace_id, v_home_app_id, now(), now());
  RAISE NOTICE 'Wired campaign-people-targets widget on People tab';

  DELETE FROM core."pageLayoutWidget"
  WHERE "pageLayoutTabId" = v_company_tab_id
    AND type = 'FRONT_COMPONENT';

  INSERT INTO core."pageLayoutWidget"
    ("universalIdentifier","id","title","type","configuration","position","gridPosition",
     "objectMetadataId","pageLayoutTabId","workspaceId","applicationId","createdAt","updatedAt")
  VALUES
    (gen_random_uuid(), gen_random_uuid(),
     'Company targets', 'FRONT_COMPONENT',
     jsonb_build_object(
       'configurationType', 'FRONT_COMPONENT',
       'frontComponentUniversalIdentifier', C_COMPANY_FC_UID::text,
       'frontComponentId', v_company_fc_id::text
     ),
     jsonb_build_object('layoutMode', 'CANVAS'),
     jsonb_build_object('row', 0, 'column', 0, 'rowSpan', 12, 'columnSpan', 12),
     v_obj_id, v_company_tab_id, v_workspace_id, v_home_app_id, now(), now());
  RAISE NOTICE 'Wired campaign-company-targets widget on Companies tab';

  RAISE NOTICE 'Campaign target tabs migration complete';
END $$;
