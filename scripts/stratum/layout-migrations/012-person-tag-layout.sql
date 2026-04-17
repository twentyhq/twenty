-- PersonTag Detail View Layout
-- Makes the person and tag relation fields visible on the PersonTag detail page.
-- Uses UPDATE for fields that already exist as orphaned rows (no group assigned),
-- INSERT only for fields not yet in the view at all.
--
-- Creates:
--   Details group (pos 0): person, tag
--   Other group   (pos 1): createdAt, createdBy, updatedAt, updatedBy

DO $$
DECLARE
  v_workspace_id      UUID;
  v_app_id            UUID;
  v_obj_id            UUID;
  v_view_id           UUID;
  v_details_group_id  UUID;
  v_other_group_id    UUID;
  v_field_id          UUID;
  v_existing_vf_id    UUID;
BEGIN
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;
  SELECT id INTO v_app_id FROM core.application
    WHERE "workspaceId" = v_workspace_id LIMIT 1;

  SELECT id INTO v_obj_id FROM core."objectMetadata"
    WHERE "nameSingular" = 'persontag';

  IF v_obj_id IS NULL THEN
    RAISE NOTICE 'SKIP: persontag object not found';
    RETURN;
  END IF;

  SELECT (pw.configuration->>'viewId')::UUID INTO v_view_id
  FROM core."pageLayout" pl
  JOIN core."objectMetadata" om ON om.id = pl."objectMetadataId"
  JOIN core."pageLayoutTab" plt ON plt."pageLayoutId" = pl.id
  JOIN core."pageLayoutWidget" pw ON pw."pageLayoutTabId" = plt.id
  WHERE om."nameSingular" = 'persontag'
    AND plt.title = 'Home'
    AND pw.type = 'FIELDS';

  IF v_view_id IS NULL THEN
    RAISE NOTICE 'SKIP: persontag FIELDS widget view not found';
    RETURN;
  END IF;

  -- Create Details group if absent
  SELECT id INTO v_details_group_id FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Details';
  IF v_details_group_id IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), 'Details', 0, true,
            v_view_id, v_workspace_id, v_app_id, now(), now())
    RETURNING id INTO v_details_group_id;
    RAISE NOTICE 'Created group: Details → %', v_details_group_id;
  ELSE
    RAISE NOTICE 'OK (exists): Details group %', v_details_group_id;
  END IF;

  -- Create Other group if absent
  SELECT id INTO v_other_group_id FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Other';
  IF v_other_group_id IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), 'Other', 1, true,
            v_view_id, v_workspace_id, v_app_id, now(), now())
    RETURNING id INTO v_other_group_id;
    RAISE NOTICE 'Created group: Other → %', v_other_group_id;
  ELSE
    RAISE NOTICE 'OK (exists): Other group %', v_other_group_id;
  END IF;

  -- ── Details group ──────────────────────────────────────────────────────────

  -- person
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'person';
  SELECT id INTO v_existing_vf_id FROM core."viewField"
    WHERE "fieldMetadataId" = v_field_id AND "viewId" = v_view_id AND "deletedAt" IS NULL;
  IF v_existing_vf_id IS NOT NULL THEN
    UPDATE core."viewField" SET "viewFieldGroupId" = v_details_group_id, position = 0 WHERE id = v_existing_vf_id;
    RAISE NOTICE 'MOVED: person → Details (pos 0)';
  ELSE
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 0,
            v_view_id, v_details_group_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'ADDED: person → Details (pos 0)';
  END IF;

  -- tag
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'tag';
  SELECT id INTO v_existing_vf_id FROM core."viewField"
    WHERE "fieldMetadataId" = v_field_id AND "viewId" = v_view_id AND "deletedAt" IS NULL;
  IF v_existing_vf_id IS NOT NULL THEN
    UPDATE core."viewField" SET "viewFieldGroupId" = v_details_group_id, position = 1 WHERE id = v_existing_vf_id;
    RAISE NOTICE 'MOVED: tag → Details (pos 1)';
  ELSE
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 1,
            v_view_id, v_details_group_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'ADDED: tag → Details (pos 1)';
  END IF;

  -- ── Other group ────────────────────────────────────────────────────────────

  -- createdAt
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'createdAt';
  SELECT id INTO v_existing_vf_id FROM core."viewField"
    WHERE "fieldMetadataId" = v_field_id AND "viewId" = v_view_id AND "deletedAt" IS NULL;
  IF v_existing_vf_id IS NOT NULL THEN
    UPDATE core."viewField" SET "viewFieldGroupId" = v_other_group_id, position = 0 WHERE id = v_existing_vf_id;
    RAISE NOTICE 'MOVED: createdAt → Other (pos 0)';
  ELSE
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 0,
            v_view_id, v_other_group_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'ADDED: createdAt → Other (pos 0)';
  END IF;

  -- createdBy
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'createdBy';
  SELECT id INTO v_existing_vf_id FROM core."viewField"
    WHERE "fieldMetadataId" = v_field_id AND "viewId" = v_view_id AND "deletedAt" IS NULL;
  IF v_existing_vf_id IS NOT NULL THEN
    UPDATE core."viewField" SET "viewFieldGroupId" = v_other_group_id, position = 1 WHERE id = v_existing_vf_id;
    RAISE NOTICE 'MOVED: createdBy → Other (pos 1)';
  ELSE
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 1,
            v_view_id, v_other_group_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'ADDED: createdBy → Other (pos 1)';
  END IF;

  -- updatedAt
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'updatedAt';
  SELECT id INTO v_existing_vf_id FROM core."viewField"
    WHERE "fieldMetadataId" = v_field_id AND "viewId" = v_view_id AND "deletedAt" IS NULL;
  IF v_existing_vf_id IS NOT NULL THEN
    UPDATE core."viewField" SET "viewFieldGroupId" = v_other_group_id, position = 2 WHERE id = v_existing_vf_id;
    RAISE NOTICE 'MOVED: updatedAt → Other (pos 2)';
  ELSE
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 2,
            v_view_id, v_other_group_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'ADDED: updatedAt → Other (pos 2)';
  END IF;

  -- updatedBy
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'updatedBy';
  SELECT id INTO v_existing_vf_id FROM core."viewField"
    WHERE "fieldMetadataId" = v_field_id AND "viewId" = v_view_id AND "deletedAt" IS NULL;
  IF v_existing_vf_id IS NOT NULL THEN
    UPDATE core."viewField" SET "viewFieldGroupId" = v_other_group_id, position = 3 WHERE id = v_existing_vf_id;
    RAISE NOTICE 'MOVED: updatedBy → Other (pos 3)';
  ELSE
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 3,
            v_view_id, v_other_group_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'ADDED: updatedBy → Other (pos 3)';
  END IF;

END $$;
