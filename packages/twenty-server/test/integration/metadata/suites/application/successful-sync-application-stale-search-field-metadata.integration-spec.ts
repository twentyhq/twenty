import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  getFieldUniversalIdentifier,
  getSearchFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { type SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const TEST_APP_UNIVERSAL_IDENTIFIER = uuidv4();
const TEST_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'staleSearchRowRocket';
const OBJECT_NAME_PLURAL = 'staleSearchRowRockets';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  getSearchFieldUniversalIdentifier({
    applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  });

const TEST_OBJECT: ObjectManifest = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  nameSingular: OBJECT_NAME_SINGULAR,
  namePlural: OBJECT_NAME_PLURAL,
  labelSingular: 'Stale Search Row Rocket',
  labelPlural: 'Stale Search Row Rockets',
  description: 'A rocket whose cached field metadata predates its search row',
  icon: 'IconRocket',
  isSearchable: true,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
    },
  ],
};

const buildTestManifest = () =>
  buildBaseManifest({
    appId: TEST_APP_UNIVERSAL_IDENTIFIER,
    roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
    overrides: { objects: [TEST_OBJECT] },
  });

const findSearchFieldMetadataRows = async () => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: {
      filter: { universalIdentifier: { eq: OBJECT_UNIVERSAL_IDENTIFIER } },
      paging: { first: 1 },
    },
    gqlFields: `
      id
      searchFieldMetadataList {
        id
        fieldMetadataId
        position
      }
    `,
  });

  const object = objects[0] as unknown as {
    searchFieldMetadataList: Pick<
      SearchFieldMetadataDTO,
      'id' | 'fieldMetadataId' | 'position'
    >[];
  };

  return object?.searchFieldMetadataList ?? [];
};

// A workspace upgraded from an older server keeps a cached field metadata map
// built before its search rows existed: the field still reports itself as not
// searchable while the row indexing it is already in the database. The planner
// then reads a searchability flip and plans the creation of a row that is
// already there, which the creation validator rejects with
// ENTITY_ALREADY_EXISTS and blocks the whole synchronization.
const makeCachedFieldMetadataPredateTheSearchRow = async () => {
  const [searchFieldMetadata] = await globalThis.testDataSource.query<
    {
      id: string;
      workspaceId: string;
      applicationId: string;
      objectMetadataId: string;
      fieldMetadataId: string;
      tsVectorFieldMetadataId: string;
      position: number;
      isSystemSideEffect: boolean;
    }[]
  >(
    `SELECT id, "workspaceId", "applicationId", "objectMetadataId", "fieldMetadataId", "tsVectorFieldMetadataId", position, "isSystemSideEffect"
     FROM core."searchFieldMetadata"
     WHERE "universalIdentifier" = $1`,
    [SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER],
  );

  if (!searchFieldMetadata) {
    throw new Error('The first synchronization did not create the search row');
  }

  await globalThis.testDataSource.query(
    `DELETE FROM core."searchFieldMetadata" WHERE "universalIdentifier" = $1`,
    [SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER],
  );

  const workspaceCacheService =
    getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');

  // Recomputing the field metadata map while the row is gone is what leaves the
  // cached field reporting a searchability the rows no longer back.
  await workspaceCacheService.invalidateAndRecompute(WORKSPACE_ID, [
    'flatFieldMetadataMaps',
  ]);

  await globalThis.testDataSource.query(
    `INSERT INTO core."searchFieldMetadata" (id, "workspaceId", "applicationId", "objectMetadataId", "fieldMetadataId", "tsVectorFieldMetadataId", position, "isSystemSideEffect", "universalIdentifier", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())`,
    [
      searchFieldMetadata.id,
      searchFieldMetadata.workspaceId,
      searchFieldMetadata.applicationId,
      searchFieldMetadata.objectMetadataId,
      searchFieldMetadata.fieldMetadataId,
      searchFieldMetadata.tsVectorFieldMetadataId,
      searchFieldMetadata.position,
      searchFieldMetadata.isSystemSideEffect,
      SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
    ],
  );

  // The search row map is the source of truth for a field's searchability, so it
  // is refreshed from the database while the field metadata map is left behind.
  await workspaceCacheService.invalidateAndRecompute(WORKSPACE_ID, [
    'flatSearchFieldMetadataMaps',
  ]);
};

describe('Application manifest sync with a cached field metadata predating the search row', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync-stale-search-row',
    });

    await syncApplication({
      expectToFail: false,
      manifest: buildTestManifest(),
    });

    await makeCachedFieldMetadataPredateTheSearchRow();
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should not plan a duplicate search row for a field already indexed', async () => {
    const { errors } = await syncApplication({
      expectToFail: false,
      manifest: buildTestManifest(),
    });

    expect(errors).toBeUndefined();

    const searchFieldMetadataRows = await findSearchFieldMetadataRows();

    expect(searchFieldMetadataRows).toHaveLength(1);
  }, 120000);
});
