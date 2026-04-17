-- Account Tags Junction Setup
-- Run this on any new environment (production, fresh UAT, etc.) after the
-- accounttag / tag custom objects have been created.
--
-- What it does:
--   1. Sets junctionTargetFieldId on the accounttags field on company so the
--      frontend knows to display Tag names instead of AccountTag UUIDs.
--   2. Enables IS_JUNCTION_RELATIONS_ENABLED so the multi-select picker opens
--      when clicking the accountTags field, allowing tags to be added/removed.
--   3. Flushes the workspace cache (done separately — see instructions below).
--
-- Prerequisites:
--   - custom objects exist: accounttag, tag
--   - company.accounttags (ONE_TO_MANY → accounttag) exists
--   - accounttag.tag (MANY_TO_ONE → tag) exists
--
-- To run on production:
--   cat > /tmp/010-account-tags-junction.sql << 'EOF'
--   <paste this file>
--   EOF
--   B64=$(base64 -w0 /tmp/010-account-tags-junction.sql)
--   railway ssh --environment production --service twenty-front -- \
--     "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"
--
-- After running, flush the cache:
--   railway ssh --environment production --service twenty-front -- \
--     "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"
-- Then hard-refresh the browser (Ctrl+Shift+R).

DO $$
DECLARE
  v_workspace_id             UUID;
  v_accounttag_obj_id        UUID;
  v_tag_field_id             UUID;
  v_accounttags_field_id     UUID;
  v_current_junction_id      TEXT;
BEGIN
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;

  -- 1. Resolve the accounttag object
  SELECT id INTO v_accounttag_obj_id FROM core."objectMetadata"
    WHERE "nameSingular" = 'accounttag';

  IF v_accounttag_obj_id IS NULL THEN
    RAISE NOTICE 'SKIP: accounttag object not found — has it been created yet?';
  ELSE
    -- 2. Find the tag field on accounttag (MANY_TO_ONE → tag)
    SELECT id INTO v_tag_field_id FROM core."fieldMetadata"
      WHERE "objectMetadataId" = v_accounttag_obj_id
        AND name = 'tag'
        AND type = 'RELATION';

    IF v_tag_field_id IS NULL THEN
      RAISE NOTICE 'SKIP: tag field not found on accounttag';
    ELSE
      -- 3. Find accounttags field on company
      SELECT fm.id INTO v_accounttags_field_id
      FROM core."fieldMetadata" fm
      JOIN core."objectMetadata" om ON om.id = fm."objectMetadataId"
      WHERE om."nameSingular" = 'company'
        AND fm.name = 'accountTags'
        AND fm.type = 'RELATION';

      IF v_accounttags_field_id IS NULL THEN
        RAISE NOTICE 'SKIP: accounttags field not found on company';
      ELSE
        -- Check if already set correctly
        SELECT settings->>'junctionTargetFieldId' INTO v_current_junction_id
        FROM core."fieldMetadata" WHERE id = v_accounttags_field_id;

        IF v_current_junction_id = v_tag_field_id::text THEN
          RAISE NOTICE 'OK (already set): junctionTargetFieldId on accounttags = %', v_tag_field_id;
        ELSE
          UPDATE core."fieldMetadata"
          SET settings = settings || jsonb_build_object('junctionTargetFieldId', v_tag_field_id::text)
          WHERE id = v_accounttags_field_id;
          RAISE NOTICE 'SET: junctionTargetFieldId on accounttags → %', v_tag_field_id;
        END IF;
      END IF;
    END IF;
  END IF;

  -- 4. Enable IS_JUNCTION_RELATIONS_ENABLED feature flag
  INSERT INTO core."featureFlag" (id, key, value, "workspaceId")
  VALUES (gen_random_uuid(), 'IS_JUNCTION_RELATIONS_ENABLED', true, v_workspace_id)
  ON CONFLICT DO NOTHING;
  RAISE NOTICE 'SET: IS_JUNCTION_RELATIONS_ENABLED feature flag enabled';
END $$;
