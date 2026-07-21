import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_UNIVERSAL_IDENTIFIER = uuidv4();
const TEST_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'searchableRocket';
const OBJECT_NAME_PLURAL = 'searchableRockets';

const RECORD_NAME_VALUE = 'FalconHeavyManifestSearchTerm';
const OTHER_RECORD_NAME_VALUE = 'AtlasFiveManifestSearchTerm';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const TEST_OBJECT: ObjectManifest = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  nameSingular: OBJECT_NAME_SINGULAR,
  namePlural: OBJECT_NAME_PLURAL,
  labelSingular: 'Searchable Rocket',
  labelPlural: 'Searchable Rockets',
  description: 'A rocket synced through the manifest funnel',
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

describe('Application manifest sync search field metadata population', () => {
  let matchingRecordId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync-search',
    });

    await syncApplication({
      expectToFail: false,
      manifest: buildBaseManifest({
        appId: TEST_APP_UNIVERSAL_IDENTIFIER,
        roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { objects: [TEST_OBJECT] },
      }),
    });

    const { data } = await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: 'id name',
      data: [
        { name: RECORD_NAME_VALUE },
        { name: OTHER_RECORD_NAME_VALUE },
      ],
      expectToFail: false,
    });

    const matchingRecord = data.createdRecords.find(
      (record) => record.name === RECORD_NAME_VALUE,
    );

    if (matchingRecord === undefined) {
      throw new Error('Could not create the record to search for');
    }

    matchingRecordId = matchingRecord.id;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should make the synced object searchable through its server-synthesized search field metadata', async () => {
    const searchResult = await search({
      searchInput: RECORD_NAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchResult.data.search.edges).toHaveLength(1);

    const searchResultNode = searchResult.data.search.edges[0].node;

    expect(searchResultNode.recordId).toBe(matchingRecordId);
    expect(searchResultNode.objectNameSingular).toBe(OBJECT_NAME_SINGULAR);
    expect(searchResultNode.label).toBe(RECORD_NAME_VALUE);
  }, 60000);

  it('should not return records whose label identifier does not match the search term', async () => {
    const searchResult = await search({
      searchInput: RECORD_NAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    const returnedRecordIds = searchResult.data.search.edges.map(
      (edge) => edge.node.recordId,
    );

    expect(returnedRecordIds).not.toContain(OTHER_RECORD_NAME_VALUE);
    expect(returnedRecordIds).toEqual([matchingRecordId]);
  }, 60000);
});
