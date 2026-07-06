import { FieldMetadataType } from 'twenty-shared/types';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

const TEST_APP_ID = 'b1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'b1b2c3d4-0002-4000-a000-000000000002';
const DUPLICATED_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2c3d4-0003-4000-a000-000000000003';
const DUPLICATED_FIELD_UNIVERSAL_IDENTIFIER =
  'b1b2c3d4-0004-4000-a000-000000000004';

describe('Sync application should surface a human error on flat-entity map conflicts', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Flat Entity Map Conflict App',
      description: 'App for testing flat-entity map conflict error formatting',
      sourcePath: 'test-flat-entity-map-conflict',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should fail with an installation error naming the object when two objects share a universalIdentifier', async () => {
    const firstObject = buildDefaultObjectManifest({
      applicationUniversalIdentifier: TEST_APP_ID,
      nameSingular: 'invoice',
      namePlural: 'invoices',
      labelSingular: 'Invoice',
      labelPlural: 'Invoices',
      universalIdentifier: DUPLICATED_OBJECT_UNIVERSAL_IDENTIFIER,
    });

    const conflictingObject = buildDefaultObjectManifest({
      applicationUniversalIdentifier: TEST_APP_ID,
      nameSingular: 'invoiceDuplicate',
      namePlural: 'invoiceDuplicates',
      labelSingular: 'Invoice Duplicate',
      labelPlural: 'Invoice Duplicates',
      universalIdentifier: DUPLICATED_OBJECT_UNIVERSAL_IDENTIFIER,
    });

    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        objects: [firstObject, conflictingObject],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail with an installation error naming the field when two fields of an object share a universalIdentifier', async () => {
    const objectWithConflictingFields = buildDefaultObjectManifest({
      applicationUniversalIdentifier: TEST_APP_ID,
      nameSingular: 'invoice',
      namePlural: 'invoices',
      labelSingular: 'Invoice',
      labelPlural: 'Invoices',
      additionalFields: [
        {
          universalIdentifier: DUPLICATED_FIELD_UNIVERSAL_IDENTIFIER,
          type: FieldMetadataType.DATE_TIME,
          name: 'dueDate',
          label: 'Due Date',
        },
        {
          universalIdentifier: DUPLICATED_FIELD_UNIVERSAL_IDENTIFIER,
          type: FieldMetadataType.DATE_TIME,
          name: 'dueDateDuplicate',
          label: 'Due Date Duplicate',
        },
      ],
    });

    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        objects: [objectWithConflictingFields],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
