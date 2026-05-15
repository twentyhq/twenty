import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { SYSTEM_FIELD_UUID_NAMESPACE } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';

// Regression test for the bug discovered after the v2.5 upgrade rolled
// `NormalizeCompositeFieldDefaultsCommand` to prod: app re-installs
// failed with `FIELD_MUTATION_NOT_ALLOWED` on 30 system fields because
// the manifest-derived TO map didn't include them while the workspace
// FROM map did (now with non-null defaultValues from the backfill).
//
// Post-fix, the server attaches the eight standard system fields to TO
// itself, with deterministic v5 universalIdentifiers derived from
// `${objectMetadataUniversalIdentifier}/${name}` so they line up with
// the rows already in the workspace.
const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();
const LABEL_FIELD_UNIVERSAL_IDENTIFIER = uuidv4();
const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const SYSTEM_FIELD_NAMES = [
  'id',
  'createdAt',
  'createdBy',
  'deletedAt',
  'position',
  'searchVector',
  'updatedAt',
  'updatedBy',
] as const;

const buildManifestWithObjectThatHasNoSystemFields = (): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [
        {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          labelIdentifierFieldMetadataUniversalIdentifier:
            LABEL_FIELD_UNIVERSAL_IDENTIFIER,
          nameSingular: 'autoSystemFieldTicket',
          namePlural: 'autoSystemFieldTickets',
          labelSingular: 'Auto System Field Ticket',
          labelPlural: 'Auto System Field Tickets',
          description: 'Object that does not declare its own system fields',
          icon: 'IconTicket',
          fields: [
            {
              universalIdentifier: LABEL_FIELD_UNIVERSAL_IDENTIFIER,
              type: FieldMetadataType.TEXT,
              name: 'title',
              label: 'Title',
              description: 'Label identifier field',
              icon: 'IconTextCaption',
            },
          ],
        },
      ],
    },
  });

const expectedSystemFieldUniversalIdentifier = (name: string): string =>
  uuidv5(
    `${OBJECT_UNIVERSAL_IDENTIFIER}/${name}`,
    SYSTEM_FIELD_UUID_NAMESPACE,
  );

const fetchSystemFieldRows = async () => {
  return (await globalThis.testDataSource.query(
    `SELECT name, "universalIdentifier", "isSystem", "defaultValue"
       FROM core."fieldMetadata"
      WHERE "workspaceId" = $1
        AND "objectMetadataId" IN (
          SELECT id FROM core."objectMetadata"
           WHERE "workspaceId" = $1
             AND "universalIdentifier" = $2
        )
        AND name = ANY($3)`,
    [TEST_WORKSPACE_ID, OBJECT_UNIVERSAL_IDENTIFIER, SYSTEM_FIELD_NAMES],
  )) as Array<{
    name: string;
    universalIdentifier: string;
    isSystem: boolean;
    defaultValue: unknown;
  }>;
};

describe('Sync application auto-attaches system fields to a custom object', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Auto System Fields App',
      description:
        'App used to exercise auto-attached system fields on object sync',
      sourcePath: 'test-auto-system-fields',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates the eight standard system fields with v5 universalIdentifiers on first sync', async () => {
    const manifest = buildManifestWithObjectThatHasNoSystemFields();

    const { errors } = await syncApplication({ manifest });

    expect(errors).toBeUndefined();

    const rows = await fetchSystemFieldRows();

    expect(rows).toHaveLength(SYSTEM_FIELD_NAMES.length);

    for (const name of SYSTEM_FIELD_NAMES) {
      const row = rows.find((r) => r.name === name);

      expect(row).toBeDefined();
      expect(row?.isSystem).toBe(true);
      expect(row?.universalIdentifier).toBe(
        expectedSystemFieldUniversalIdentifier(name),
      );
    }
  }, 60000);

  it('re-syncing the same manifest is a no-op for system fields', async () => {
    const manifest = buildManifestWithObjectThatHasNoSystemFields();

    const firstSync = await syncApplication({ manifest });

    expect(firstSync.errors).toBeUndefined();

    const secondSync = await syncApplication({ manifest });

    expect(secondSync.errors).toBeUndefined();

    const rows = await fetchSystemFieldRows();

    expect(rows).toHaveLength(SYSTEM_FIELD_NAMES.length);
  }, 60000);

  // This is the precise shape that failed on prod after the v2.5
  // NormalizeCompositeFieldDefaultsCommand ran: the workspace had its
  // composite system fields' defaultValue rewritten, then a subsequent
  // app re-sync diffed the (FROM with new defaults) against the
  // (TO without system fields) and was rejected on every one.
  it('handles a re-sync after the workspace mutated a system field defaultValue (post-2.5-backfill shape)', async () => {
    const manifest = buildManifestWithObjectThatHasNoSystemFields();

    const firstSync = await syncApplication({ manifest });

    expect(firstSync.errors).toBeUndefined();

    // Simulate `NormalizeCompositeFieldDefaultsCommand` clearing the
    // composite system field's defaultValue. The v5 universalIdentifier
    // and every other property are preserved.
    await globalThis.testDataSource.query(
      `UPDATE core."fieldMetadata"
          SET "defaultValue" = NULL
        WHERE "workspaceId" = $1
          AND "universalIdentifier" = $2`,
      [
        TEST_WORKSPACE_ID,
        expectedSystemFieldUniversalIdentifier('createdBy'),
      ],
    );

    const secondSync = await syncApplication({ manifest });

    expect(secondSync.errors).toBeUndefined();
  }, 60000);
});
