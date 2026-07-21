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

const OBJECT_NAME_SINGULAR = 'relabelableRocket';
const OBJECT_NAME_PLURAL = 'relabelableRockets';

const RECORD_NAME_VALUE = 'AlphaManifestRelabelNameTerm';
const RECORD_TOTO_VALUE = 'BravoManifestRelabelTotoTerm';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const TOTO_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'toto',
});

const NAME_FIELD_MANIFEST = {
  universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
} as const;

const TOTO_FIELD_MANIFEST = {
  universalIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
  name: 'toto',
  label: 'Toto',
} as const;

const buildObjectManifest = ({
  labelIdentifierFieldMetadataUniversalIdentifier,
  fields,
}: {
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  fields: ObjectManifest['fields'];
}): ObjectManifest => ({
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier,
  nameSingular: OBJECT_NAME_SINGULAR,
  namePlural: OBJECT_NAME_PLURAL,
  labelSingular: 'Relabelable Rocket',
  labelPlural: 'Relabelable Rockets',
  description: 'A rocket whose label identifier is relabeled across syncs',
  icon: 'IconRocket',
  isSearchable: true,
  fields,
});

const syncObjectManifest = async (objectManifest: ObjectManifest) => {
  await syncApplication({
    expectToFail: false,
    manifest: buildBaseManifest({
      appId: TEST_APP_UNIVERSAL_IDENTIFIER,
      roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
      overrides: { objects: [objectManifest] },
    }),
  });
};

const searchRecordIds = async (searchInput: string): Promise<string[]> => {
  const searchResult = await search({
    searchInput,
    includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
    limit: 10,
    expectToFail: false,
  });

  return searchResult.data.search.edges.map((edge) => edge.node.recordId);
};

describe('Application manifest sync - search field metadata on label identifier relabel', () => {
  let recordId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync-search-relabel',
    });

    // First sync: object with `name` and `toto` text fields, `name` as label
    // identifier. `toto` exists from the start but is not the label identifier,
    // so only `name` is indexed for search initially.
    // NOTE: `toto` is created here rather than in the relabel sync because a
    // single sync cannot both create a field and relabel the object onto it
    // yet (objectMetadata.update is ordered before fieldMetadata.create in the
    // migration runner). Tracked for a follow-up core fix:
    // https://github.com/twentyhq/core-team-issues/issues/2655
    await syncObjectManifest(
      buildObjectManifest({
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        fields: [NAME_FIELD_MANIFEST, TOTO_FIELD_MANIFEST],
      }),
    );

    const { data } = await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: 'id name toto',
      data: [{ name: RECORD_NAME_VALUE, toto: RECORD_TOTO_VALUE }],
      expectToFail: false,
    });

    recordId = data.createdRecords[0].id;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should make records searchable through the name label identifier only', async () => {
    expect(await searchRecordIds(RECORD_NAME_VALUE)).toEqual([recordId]);
    // `toto` is not the label identifier yet, so it is not part of the search surface.
    expect(await searchRecordIds(RECORD_TOTO_VALUE)).toEqual([]);
  }, 120000);

  it('should make records searchable through both name and toto after relabeling onto toto', async () => {
    // Second sync: relabel the object onto the pre-existing `toto` field.
    await syncObjectManifest(
      buildObjectManifest({
        labelIdentifierFieldMetadataUniversalIdentifier:
          TOTO_FIELD_UNIVERSAL_IDENTIFIER,
        fields: [NAME_FIELD_MANIFEST, TOTO_FIELD_MANIFEST],
      }),
    );

    // Relabeling is additive: the previous `name` surface is preserved.
    expect(await searchRecordIds(RECORD_NAME_VALUE)).toEqual([recordId]);
    expect(await searchRecordIds(RECORD_TOTO_VALUE)).toEqual([recordId]);
  }, 120000);

  it('should only remain searchable through name after toto is removed', async () => {
    // Third sync: relabel back onto `name` and remove the `toto` field. Removing
    // the field must drop its searchFieldMetadata row so it leaves the search surface.
    await syncObjectManifest(
      buildObjectManifest({
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        fields: [NAME_FIELD_MANIFEST],
      }),
    );

    expect(await searchRecordIds(RECORD_NAME_VALUE)).toEqual([recordId]);
    expect(await searchRecordIds(RECORD_TOTO_VALUE)).toEqual([]);
  }, 120000);
});
