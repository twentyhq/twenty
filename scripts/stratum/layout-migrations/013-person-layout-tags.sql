-- Person Detail View — Add Tags Field
-- Adds the persontags relation field to the Person detail page General group
-- so that tags appear as chips on a Person record.
-- Inserted at position 3.5 (between Job Title at 3 and Opportunities at 5).

DO $$
DECLARE
  v_workspace_id   UUID;
  v_app_id         UUID;
  v_obj_id         UUID;
  v_view_id        UUID;
  v_group_id       UUID;
  v_field_id       UUID;
BEGIN
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;
  SELECT id INTO v_app_id FROM core.application
    WHERE "workspaceId" = v_workspace_id LIMIT 1;

  SELECT id INTO v_obj_id FROM core."objectMetadata"
    WHERE "nameSingular" = 'person';

  -- Resolve the FIELDS widget view on the Person Home tab
  SELECT (pw.configuration->>'viewId')::UUID INTO v_view_id
  FROM core."pageLayout" pl
  JOIN core."objectMetadata" om ON om.id = pl."objectMetadataId"
  JOIN core."pageLayoutTab" plt ON plt."pageLayoutId" = pl.id
  JOIN core."pageLayoutWidget" pw ON pw."pageLayoutTabId" = plt.id
  WHERE om."nameSingular" = 'person'
    AND plt.title = 'Home'
    AND pw.type = 'FIELDS';

  IF v_view_id IS NULL THEN
    RAISE NOTICE 'SKIP: person FIELDS widget view not found';
    RETURN;
  END IF;

  -- Find the General group
  SELECT id INTO v_group_id FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'General';

  IF v_group_id IS NULL THEN
    RAISE NOTICE 'SKIP: General group not found on person view';
    RETURN;
  END IF;

  -- Find the persontags field on person
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'persontags';

  IF v_field_id IS NULL THEN
    RAISE NOTICE 'SKIP: persontags field not found on person';
    RETURN;
  END IF;

  -- Add persontags to General group (idempotent)
  IF NOT EXISTS (
    SELECT 1 FROM core."viewField"
    WHERE "viewFieldGroupId" = v_group_id
      AND "fieldMetadataId" = v_field_id AND "deletedAt" IS NULL
  ) THEN
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), v_field_id, true, 0, 3.5,
            v_view_id, v_group_id, v_workspace_id, v_app_id, now(), now());
    RAISE NOTICE 'Added: persontags → Person General group (position 3.5)';
  ELSE
    RAISE NOTICE 'OK (already exists): persontags in Person General group';
  END IF;
END $$;
