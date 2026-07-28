import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'duplicatedDataObject',
  namePlural: 'duplicatedDataObjects',
  labelSingular: 'Duplicated Data Object',
  labelPlural: 'Duplicated Data Objects',
  description: 'Object used to test unique index creation over duplicated data',
});

const buildManifest = ({ isUnique }: { isUnique: boolean }): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [TEST_OBJECT],
      fields: [
        {
          universalIdentifier: TEST_FIELD_ID,
          type: FieldMetadataType.TEXT,
          name: 'externalId',
          label: 'External ID',
          description: 'External identifier',
          icon: 'IconId',
          isUnique,
          isNullable: true,
          objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
        },
      ],
    },
  });

const createRecordWithExternalId = async (externalId: string) => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName: TEST_OBJECT.nameSingular,
      gqlFields: `
        id
        externalId
      `,
      data: { id: uuidv4(), externalId },
    }),
  );

  return response.body.data?.[`create${capitalize(TEST_OBJECT.nameSingular)}`];
};

describe('Sync application should surface the root cause when a unique index cannot be created over duplicated data', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Unique Index Duplicate Data App',
      description: 'App for testing unique index creation over duplicated data',
      sourcePath: 'test-unique-index-duplicate-data',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should fail with the underlying postgres error in the migration runner error message', async () => {
    await syncApplication({
      manifest: buildManifest({ isUnique: false }),
      expectToFail: false,
    });

    const firstRecord = await createRecordWithExternalId('DUPLICATED-VALUE');
    const secondRecord = await createRecordWithExternalId('DUPLICATED-VALUE');

    expect(firstRecord?.externalId).toBe('DUPLICATED-VALUE');
    expect(secondRecord?.externalId).toBe('DUPLICATED-VALUE');

    // Turning the field unique generates a create action for its backing
    // unique index; the index cannot be created over duplicated data so the
    // migration runner fails at workspace schema level with a 23505.
    const { errors } = await syncApplication({
      manifest: buildManifest({ isUnique: true }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);

    const errorMessage = errors?.[0]?.message;

    expect(errorMessage).toContain("Migration action 'create' for 'index'");
    expect(errorMessage).toContain('failed: [workspaceSchema]');
    expect(errorMessage).toContain('could not create unique index');
    expect(errorMessage).toContain('pg code: 23505');
    expect(errorMessage).toContain('is duplicated');
  }, 60000);
});
