import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'searchVectorHijackTarget';
const OBJECT_NAME_PLURAL = 'searchVectorHijackTargets';

const SEARCH_VECTOR_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_ID,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'searchVector',
});

const buildCleanObject = (): ObjectManifest =>
  buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    nameSingular: OBJECT_NAME_SINGULAR,
    namePlural: OBJECT_NAME_PLURAL,
    labelSingular: 'Search Vector Hijack Target',
    labelPlural: 'Search Vector Hijack Targets',
    description: 'Object used to test search vector identifier hijack',
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

// Squat the engine-owned searchVector slot: declare a foreign, non-system
// field carrying the deterministic universal identifier the engine derives
// for searchVector. This is the exact override a malicious manifest could
// attempt on a second sync to hijack a system field.
const buildObjectHijackingSearchVectorUniversalIdentifier =
  (): ObjectManifest => {
    const cleanObject = buildCleanObject();

    return {
      ...cleanObject,
      fields: [
        ...cleanObject.fields,
        {
          universalIdentifier: SEARCH_VECTOR_UNIVERSAL_IDENTIFIER,
          type: FieldMetadataType.TEXT,
          name: 'stolenSearchVector',
          label: 'Stolen Search Vector',
          isNullable: true,
        },
      ],
    };
  };

// Redeclare searchVector under its derived universal identifier: the builder
// matches the engine-provisioned field and emits an update, rejected because
// the manifest defaults mutate properties system fields do not allow updating.
const buildObjectAuthoringSearchVector = (): ObjectManifest => {
  const cleanObject = buildCleanObject();

  return {
    ...cleanObject,
    fields: [
      ...cleanObject.fields,
      {
        universalIdentifier: SEARCH_VECTOR_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.TS_VECTOR,
        name: 'searchVector',
        label: 'Search vector',
      },
    ],
  };
};

// Declare a field reusing the reserved searchVector name under a foreign
// universal identifier: the builder emits a create colliding with the
// engine-provisioned field name.
const buildObjectCreatingForeignSearchVector = (): ObjectManifest => {
  const cleanObject = buildCleanObject();

  return {
    ...cleanObject,
    fields: [
      ...cleanObject.fields,
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.TEXT,
        name: 'searchVector',
        label: 'Foreign Search Vector',
        isNullable: true,
      },
    ],
  };
};

describe('Sync application should reject hijacking the searchVector system field', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Search Vector Hijack App',
      description: 'App for testing search vector identifier hijack',
      sourcePath: 'test-search-vector-hijack',
    });

    await syncApplication({
      expectToFail: false,
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: { objects: [buildCleanObject()] },
      }),
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should reject a manifest field declared under the reserved searchVector name', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: { objects: [buildObjectAuthoringSearchVector()] },
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should reject a manifest field reusing the searchVector name under a foreign universal identifier', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: { objects: [buildObjectCreatingForeignSearchVector()] },
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should reject a manifest field squatting the searchVector deterministic universal identifier', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: {
          objects: [buildObjectHijackingSearchVectorUniversalIdentifier()],
        },
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
