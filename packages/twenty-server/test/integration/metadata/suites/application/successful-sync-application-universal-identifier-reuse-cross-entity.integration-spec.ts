import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { type FieldManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const REUSABLE_UID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  universalIdentifier: REUSABLE_UID,
  nameSingular: 'ephemeral',
  namePlural: 'ephemerals',
  labelSingular: 'Ephemeral',
  labelPlural: 'Ephemerals',
  description: 'An ephemeral object that will be removed on second sync',
  icon: 'IconTrash',
});

const REUSED_UID_FIELD: FieldManifest = {
  universalIdentifier: REUSABLE_UID,
  type: FieldMetadataType.TEXT,
  name: 'reusedUidField',
  label: 'Reused UID Field',
  description:
    'Field that reuses the universalIdentifier from the deleted object',
  icon: 'IconRefresh',
  objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
};

describe('Cross-entity universalIdentifier reuse across syncs', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test UID Reuse App',
      description:
        'App for testing universalIdentifier reuse across entity types',
      sourcePath: 'test-uid-reuse',
    });
  }, 60000);

  afterAll(async () => {
    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should allow reusing a universalIdentifier from a deleted object as a field in the same sync', async () => {
    const firstManifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        objects: [TEST_OBJECT],
      },
    });

    await syncApplication({
      manifest: firstManifest,
      expectToFail: false,
    });

    const secondManifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        objects: [],
        fields: [REUSED_UID_FIELD],
      },
    });

    await syncApplication({
      manifest: secondManifest,
      expectToFail: false,
    });
  }, 60000);
});
