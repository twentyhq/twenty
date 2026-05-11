-- Layout migration 016 — Campaign Home-tab cleanup + relation card widgets.
--
-- 1. Delete the legacy "Campaign Fields" Template FIELDS widget (and its view +
--    viewFieldGroup + viewFields). This widget was auto-created by Twenty's
--    backfill-page-layouts before we configured our proper layout in 015. It
--    only had 3 fields visible (taskTitleTemplate, taskDueDaysFromStart,
--    defaultAssignee), all of which are already in the proper layout. Leaving
--    it in place causes a duplicate FIELDS panel to render on the record page.
--
-- 2. Add prominent FIELD CARD widgets for the ONE_TO_MANY reverse relations
--    we want on the Home tab:
--      - members              (CampaignMember junction, now junction-aware →
--                              renders Persons / Companies directly via
--                              FieldWidgetJunctionRelationCard)
--      - sourcedOpportunities (Opportunity records sourced by this campaign)
--
-- FIELD CARD widgets are the chip-list panels with a "Show more" button. They
-- default to FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS = 5 in the
-- frontend (twenty-front).
--
-- Idempotent: re-running is safe.

DO $$
DECLARE
  v_workspace_id    UUID;
  v_app_id          UUID;
  v_obj_id          UUID;
  v_tab_id          UUID;
  v_dup_widget_id   UUID;
  v_dup_view_id     UUID;
  v_members_id      UUID;
  v_sourced_id      UUID;
  v_next_idx        INT;
BEGIN
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;
  SELECT id INTO v_app_id FROM core.application WHERE "workspaceId" = v_workspace_id LIMIT 1;

  SELECT id INTO v_obj_id FROM core."objectMetadata" WHERE "nameSingular" = 'campaign';
  IF v_obj_id IS NULL THEN
    RAISE EXCEPTION 'campaign object not found — run metadata migration 020-campaigns first';
  END IF;

  SELECT plt.id INTO v_tab_id
  FROM core."pageLayout" pl
  JOIN core."pageLayoutTab" plt ON plt."pageLayoutId" = pl.id
  WHERE pl."objectMetadataId" = v_obj_id AND plt.title = 'Home';
  IF v_tab_id IS NULL THEN
    RAISE EXCEPTION 'campaign Home tab not found';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 1. Delete duplicate "Campaign Fields" Template FIELDS widget if present.
  --    The proper layout widget is identified by being attached to a view
  --    that has viewFieldGroup rows; the duplicate has zero groups or its
  --    view name is 'Campaign Fields'.
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT pw.id, (pw.configuration->>'viewId')::UUID INTO v_dup_widget_id, v_dup_view_id
  FROM core."pageLayoutWidget" pw
  WHERE pw."pageLayoutTabId" = v_tab_id
    AND pw.type = 'FIELDS'
    AND (pw.configuration->>'viewId')::UUID IN (
      SELECT id FROM core.view WHERE name = 'Campaign Fields'
    );

  IF v_dup_widget_id IS NOT NULL THEN
    RAISE NOTICE 'Removing duplicate Template widget: %', v_dup_widget_id;
    -- Order: viewFields → viewFieldGroups → widget → view
    DELETE FROM core."viewField" WHERE "viewId" = v_dup_view_id;
    DELETE FROM core."viewFieldGroup" WHERE "viewId" = v_dup_view_id;
    DELETE FROM core."pageLayoutWidget" WHERE id = v_dup_widget_id;
    DELETE FROM core.view WHERE id = v_dup_view_id;
  ELSE
    RAISE NOTICE 'No duplicate Template widget found';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 2. Add FIELD CARD widgets for members and sourcedOpportunities.
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT id INTO v_members_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'members';
  SELECT id INTO v_sourced_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'sourcedOpportunities';

  -- Determine next position index on this tab
  SELECT COALESCE(MAX((position->>'index')::int), -1) + 1 INTO v_next_idx
  FROM core."pageLayoutWidget" WHERE "pageLayoutTabId" = v_tab_id;

  -- Members FIELD card
  IF v_members_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM core."pageLayoutWidget"
    WHERE "pageLayoutTabId" = v_tab_id
      AND type = 'FIELD'
      AND (configuration->>'fieldMetadataId')::UUID = v_members_id
  ) THEN
    INSERT INTO core."pageLayoutWidget"
      ("universalIdentifier","id","title","type","configuration","position","gridPosition",
       "objectMetadataId","pageLayoutTabId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Members', 'FIELD',
       jsonb_build_object(
         'configurationType', 'FIELD',
         'fieldMetadataId', v_members_id,
         'fieldDisplayMode', 'CARD'
       ),
       jsonb_build_object('index', v_next_idx, 'layoutMode', 'VERTICAL_LIST'),
       jsonb_build_object('row', 0, 'column', 0, 'rowSpan', 4, 'columnSpan', 12),
       v_obj_id, v_tab_id, v_workspace_id, v_app_id, now(), now());
    v_next_idx := v_next_idx + 1;
    RAISE NOTICE 'Added FIELD card widget: members';
  ELSE
    RAISE NOTICE 'Members FIELD card already exists or field missing';
  END IF;

  -- Sourced opportunities FIELD card
  IF v_sourced_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM core."pageLayoutWidget"
    WHERE "pageLayoutTabId" = v_tab_id
      AND type = 'FIELD'
      AND (configuration->>'fieldMetadataId')::UUID = v_sourced_id
  ) THEN
    INSERT INTO core."pageLayoutWidget"
      ("universalIdentifier","id","title","type","configuration","position","gridPosition",
       "objectMetadataId","pageLayoutTabId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Sourced Opportunities', 'FIELD',
       jsonb_build_object(
         'configurationType', 'FIELD',
         'fieldMetadataId', v_sourced_id,
         'fieldDisplayMode', 'CARD'
       ),
       jsonb_build_object('index', v_next_idx, 'layoutMode', 'VERTICAL_LIST'),
       jsonb_build_object('row', 4, 'column', 0, 'rowSpan', 4, 'columnSpan', 12),
       v_obj_id, v_tab_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'Added FIELD card widget: sourcedOpportunities';
  ELSE
    RAISE NOTICE 'sourcedOpportunities FIELD card already exists or field missing';
  END IF;

  RAISE NOTICE 'Campaign additional widgets migration complete';
END $$;
