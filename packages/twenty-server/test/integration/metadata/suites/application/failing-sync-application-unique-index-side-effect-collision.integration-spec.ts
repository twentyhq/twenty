import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  getIndexUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

const OBJECT_NAME_SINGULAR = 'collidingIndexObject';
const UNIQUE_FIELD_NAME = 'externalId';

const computeSystemUniqueIndexUniversalIdentifier = (
  objectUniversalIdentifier: string,
): string => {
  const name = generateDeterministicIndexName({
    flatObjectMetadata: {
      nameSingular: OBJECT_NAME_SINGULAR,
      applicationUniversalIdentifier: TEST_APP_ID,
    } as UniversalFlatObjectMetadata,
    orderedIndexColumnNames: [UNIQUE_FIELD_NAME],
    isUnique: true,
    indexWhereClause: null,
  });

  return getIndexUniversalIdentifier({
    applicationUniversalIdentifier: TEST_APP_ID,
    objectUniversalIdentifier,
    name,
  });
};

// The object is otherwise fully valid (all system fields present) so the reserved-identifier
// violation is the only validation error surfaced.
const buildCollidingManifest = (): Manifest => {
  const objectUniversalIdentifier = uuidv4();
  const uniqueFieldUniversalIdentifier = uuidv4();

  const object = buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    nameSingular: OBJECT_NAME_SINGULAR,
    namePlural: 'collidingIndexObjects',
    labelSingular: 'Colliding Index Object',
    labelPlural: 'Colliding Index Objects',
    description: 'Object used to test unique index side-effect collision',
    universalIdentifier: objectUniversalIdentifier,
    additionalFields: [
      {
        universalIdentifier: uniqueFieldUniversalIdentifier,
        type: FieldMetadataType.TEXT,
        name: UNIQUE_FIELD_NAME,
        label: 'External ID',
        description: 'Unique external identifier',
        icon: 'IconId',
        isUnique: true,
        isNullable: true,
      },
    ],
  });

  return buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [object],
      fields: [],
      indexes: [
        {
          universalIdentifier: computeSystemUniqueIndexUniversalIdentifier(
            objectUniversalIdentifier,
          ),
          objectUniversalIdentifier,
          isUnique: true,
          fields: [
            {
              universalIdentifier: uuidv4(),
              fieldUniversalIdentifier: uniqueFieldUniversalIdentifier,
            },
          ],
        },
      ],
    },
  });
};

describe('Sync application should fail on unique index side-effect collision', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Unique Index Collision App',
      description: 'App for testing unique index side-effect collision',
      sourcePath: 'test-unique-index-collision',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should fail when a declared index reuses the reserved deterministic identifier of the engine-owned unique backing index', async () => {
    const { errors } = await syncApplication({
      manifest: buildCollidingManifest(),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
