import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { type SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';

const TEST_APP_UNIVERSAL_IDENTIFIER = uuidv4();
const TEST_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();
const MUTED_OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'searchableSatellite';
const OBJECT_NAME_PLURAL = 'searchableSatellites';
const NICKNAME_FIELD_NAME = 'nickname';

const RECORD_NAME_VALUE = 'VoyagerManifestNameTerm';
const RECORD_NICKNAME_VALUE = 'GoldenRecordManifestNicknameTerm';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const NICKNAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: NICKNAME_FIELD_NAME,
});

const MUTED_NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: MUTED_OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const buildTestObject = ({
  nicknameIsSearchable,
}: {
  nicknameIsSearchable: boolean;
}): ObjectManifest => ({
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  nameSingular: OBJECT_NAME_SINGULAR,
  namePlural: OBJECT_NAME_PLURAL,
  labelSingular: 'Searchable Satellite',
  labelPlural: 'Searchable Satellites',
  description: 'A satellite synced through the manifest funnel',
  icon: 'IconSatellite',
  isSearchable: true,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
    },
    {
      universalIdentifier: NICKNAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
      name: NICKNAME_FIELD_NAME,
      label: 'Nickname',
      isSearchable: nicknameIsSearchable,
    },
  ],
});

// Fix regression guard: a non-searchable object whose label identifier omits
// isSearchable must not default it to true, or the sync fails validation.
const MUTED_TEST_OBJECT: ObjectManifest = {
  universalIdentifier: MUTED_OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    MUTED_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  nameSingular: 'mutedSatellite',
  namePlural: 'mutedSatellites',
  labelSingular: 'Muted Satellite',
  labelPlural: 'Muted Satellites',
  description: 'A non-searchable satellite synced through the manifest funnel',
  icon: 'IconSatelliteOff',
  isSearchable: false,
  fields: [
    {
      universalIdentifier: MUTED_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
    },
  ],
};

const syncTestManifest = async ({
  nicknameIsSearchable,
}: {
  nicknameIsSearchable: boolean;
}) =>
  syncApplication({
    expectToFail: false,
    manifest: buildBaseManifest({
      appId: TEST_APP_UNIVERSAL_IDENTIFIER,
      roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
      overrides: {
        objects: [buildTestObject({ nicknameIsSearchable }), MUTED_TEST_OBJECT],
      },
    }),
  });

const findSearchFieldMetadataList = async () => {
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
      fieldsList {
        id
        name
        isSearchable
      }
    `,
  });

  return objects[0] as unknown as ObjectMetadataDTO & {
    searchFieldMetadataList: Pick<
      SearchFieldMetadataDTO,
      'id' | 'fieldMetadataId' | 'position'
    >[];
    fieldsList: { id: string; name: string; isSearchable: boolean }[];
  };
};

describe('Application manifest sync with field-level isSearchable', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync-searchable-field',
    });

    await syncTestManifest({ nicknameIsSearchable: true });

    await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: `id name ${NICKNAME_FIELD_NAME}`,
      data: [
        {
          name: RECORD_NAME_VALUE,
          [NICKNAME_FIELD_NAME]: RECORD_NICKNAME_VALUE,
        },
      ],
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should provision a searchFieldMetadata row for a manifest field declared searchable', async () => {
    const { searchFieldMetadataList, fieldsList } =
      await findSearchFieldMetadataList();

    const nicknameField = fieldsList.find(
      (field) => field.name === NICKNAME_FIELD_NAME,
    );

    expect(nicknameField?.isSearchable).toBe(true);
    expect(
      searchFieldMetadataList.some(
        (searchFieldMetadata) =>
          searchFieldMetadata.fieldMetadataId === nicknameField?.id,
      ),
    ).toBe(true);

    const searchByNickname = await search({
      searchInput: RECORD_NICKNAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByNickname.data.search.edges).toHaveLength(1);
  }, 60000);

  it('should keep the same rows across an unchanged re-sync', async () => {
    const { searchFieldMetadataList: rowsBeforeResync } =
      await findSearchFieldMetadataList();

    await syncTestManifest({ nicknameIsSearchable: true });

    const { searchFieldMetadataList: rowsAfterResync } =
      await findSearchFieldMetadataList();

    // Convergence: an unchanged manifest must not diff isSearchable and
    // delete/recreate the rows it had just provisioned.
    expect(rowsAfterResync).toEqual(rowsBeforeResync);
  }, 60000);

  it('should drop the row when the manifest declares the field non-searchable', async () => {
    await syncTestManifest({ nicknameIsSearchable: false });

    const { searchFieldMetadataList, fieldsList } =
      await findSearchFieldMetadataList();

    const nicknameField = fieldsList.find(
      (field) => field.name === NICKNAME_FIELD_NAME,
    );

    expect(nicknameField?.isSearchable).toBe(false);
    expect(
      searchFieldMetadataList.some(
        (searchFieldMetadata) =>
          searchFieldMetadata.fieldMetadataId === nicknameField?.id,
      ),
    ).toBe(false);

    const searchByNickname = await search({
      searchInput: RECORD_NICKNAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByNickname.data.search.edges).toHaveLength(0);

    // The label identifier stays searchable throughout.
    const searchByName = await search({
      searchInput: RECORD_NAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByName.data.search.edges).toHaveLength(1);
  }, 60000);
});
