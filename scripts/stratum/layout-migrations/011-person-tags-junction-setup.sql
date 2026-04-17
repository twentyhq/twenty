-- Person Tags Junction Setup
-- Run this on any new environment (production, fresh UAT, etc.) after the
-- persontag / tag custom objects have been created.
--
-- What it does:
--   1. Sets junctionTargetFieldId on the persontags field on person so the
--      frontend knows to display Tag names instead of PersonTag UUIDs.
--   2. Enables IS_JUNCTION_RELATIONS_ENABLED (idempotent — already set if
--      Account Tags has been configured on this environment).
--
-- Prerequisites:
--   - custom objects exist: persontag, tag
--   - person.persontags (ONE_TO_MANY → persontag) exists
--   - persontag.tag (MANY_TO_ONE → tag) exists

DO $$
DECLARE
  v_workspace_id          UUID;
  v_persontag_obj_id      UUID;
  v_tag_field_id          UUID;
  v_persontags_field_id   UUID;
  v_current_junction_id   TEXT;
BEGIN
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;

  -- 1. Resolve the persontag object
  SELECT id INTO v_persontag_obj_id FROM core."objectMetadata"
    WHERE "nameSingular" = 'persontag';

  IF v_persontag_obj_id IS NULL THEN
    RAISE NOTICE 'SKIP: persontag object not found — has it been created yet?';
  ELSE
    -- 2. Find the tag field on persontag (MANY_TO_ONE → tag)
    SELECT id INTO v_tag_field_id FROM core."fieldMetadata"
      WHERE "objectMetadataId" = v_persontag_obj_id
        AND name = 'tag'
        AND type = 'RELATION';

    IF v_tag_field_id IS NULL THEN
      RAISE NOTICE 'SKIP: tag field not found on persontag';
    ELSE
      -- 3. Find persontags field on person (ONE_TO_MANY → persontag)
      SELECT fm.id INTO v_persontags_field_id
      FROM core."fieldMetadata" fm
      JOIN core."objectMetadata" om ON om.id = fm."objectMetadataId"
      WHERE om."nameSingular" = 'person'
        AND fm.name = 'personTags'
        AND fm.type = 'RELATION';

      IF v_persontags_field_id IS NULL THEN
        RAISE NOTICE 'SKIP: persontags field not found on person';
      ELSE
        -- Check if already set correctly
        SELECT settings->>'junctionTargetFieldId' INTO v_current_junction_id
        FROM core."fieldMetadata" WHERE id = v_persontags_field_id;

        IF v_current_junction_id = v_tag_field_id::text THEN
          RAISE NOTICE 'OK (already set): junctionTargetFieldId on persontags = %', v_tag_field_id;
        ELSE
          UPDATE core."fieldMetadata"
          SET settings = settings || jsonb_build_object('junctionTargetFieldId', v_tag_field_id::text)
          WHERE id = v_persontags_field_id;
          RAISE NOTICE 'SET: junctionTargetFieldId on persontags → %', v_tag_field_id;
        END IF;
      END IF;
    END IF;
  END IF;

  -- 4. Enable IS_JUNCTION_RELATIONS_ENABLED feature flag (no-op if already set)
  INSERT INTO core."featureFlag" (id, key, value, "workspaceId")
  VALUES (gen_random_uuid(), 'IS_JUNCTION_RELATIONS_ENABLED', true, v_workspace_id)
  ON CONFLICT DO NOTHING;
  RAISE NOTICE 'OK: IS_JUNCTION_RELATIONS_ENABLED feature flag ensured';
END $$;
