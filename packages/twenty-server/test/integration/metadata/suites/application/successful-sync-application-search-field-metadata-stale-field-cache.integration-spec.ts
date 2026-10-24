import omit from 'lodash.omit';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';
import { type WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_UNIVERSAL_IDENTIFIER = uuidv4();
const TEST_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const NOTE_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'note',
});

const TEST_OBJECT: ObjectManifest = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  nameSingular: 'staleCacheComet',
  namePlural: 'staleCacheComets',
  labelSingular: 'Stale Cache Comet',
  labelPlural: 'Stale Cache Comets',
  icon: 'IconComet',
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
    },
    {
      universalIdentifier: NOTE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
      name: 'note',
      label: 'Note',
    },
  ],
};

const MANIFEST = buildBaseManifest({
  appId: TEST_APP_UNIVERSAL_IDENTIFIER,
  roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
  overrides: { objects: [TEST_OBJECT] },
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
    `,
  });

  return (
    objects[0] as unknown as {
      searchFieldMetadataList: Pick<
        SearchFieldMetadataDTO,
        'id' | 'fieldMetadataId' | 'position'
      >[];
    }
  ).searchFieldMetadataList;
};

const getCachedFlatFieldMetadataMaps = async () => {
  const { flatFieldMetadataMaps } =
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatFieldMetadataMaps']);

  return flatFieldMetadataMaps;
};

const recomputeFlatFieldMetadataMaps = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatFieldMetadataMaps']);

const recomputeFlatFieldMetadataMapsWithoutIsSearchable = async () => {
  const flatFieldMetadataMapCacheService = getAppProviderByClassName<
    WorkspaceCacheProvider<FlatFieldMetadataMaps>
  >('WorkspaceFlatFieldMetadataMapCacheService');
  const computeForCache = flatFieldMetadataMapCacheService.computeForCache.bind(
    flatFieldMetadataMapCacheService,
  );

  jest
    .spyOn(flatFieldMetadataMapCacheService, 'computeForCache')
    .mockImplementationOnce(async (context) => {
      const flatFieldMetadataMaps: FlatFieldMetadataMaps =
        await computeForCache(context);
      const byUniversalIdentifier: Record<string, FlatFieldMetadata> = {};

      for (const flatFieldMetadata of Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined)) {
        byUniversalIdentifier[flatFieldMetadata.universalIdentifier] = omit(
          flatFieldMetadata,
          'isSearchable',
        ) as FlatFieldMetadata;
      }

      return { ...flatFieldMetadataMaps, byUniversalIdentifier };
    });

  await recomputeFlatFieldMetadataMaps();
};

describe('Application manifest sync with a field cache that predates isSearchable', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync-search-stale-field-cache',
    });

    await syncApplication({ expectToFail: false, manifest: MANIFEST });
  }, 60000);

  afterAll(async () => {
    jest.restoreAllMocks();
    await recomputeFlatFieldMetadataMaps();
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should re-sync without re-creating the label identifier search field metadata', async () => {
    const searchFieldMetadataListBeforeResync =
      await findSearchFieldMetadataList();

    expect(searchFieldMetadataListBeforeResync).toHaveLength(1);

    await recomputeFlatFieldMetadataMapsWithoutIsSearchable();

    const staleFlatFieldMetadataMaps = await getCachedFlatFieldMetadataMaps();

    expect(
      staleFlatFieldMetadataMaps.byUniversalIdentifier[
        NAME_FIELD_UNIVERSAL_IDENTIFIER
      ],
    ).not.toHaveProperty('isSearchable');

    const { data, errors } = await syncApplication({
      expectToFail: false,
      manifest: MANIFEST,
    });

    expect(errors).toBeUndefined();
    expect(
      data.syncApplication.actions.filter(
        (action) => action.metadataName === 'searchFieldMetadata',
      ),
    ).toEqual([]);

    const searchFieldMetadataListAfterResync =
      await findSearchFieldMetadataList();

    expect(searchFieldMetadataListAfterResync).toEqual(
      searchFieldMetadataListBeforeResync,
    );

    const healedFlatFieldMetadataMaps = await getCachedFlatFieldMetadataMaps();

    expect(
      healedFlatFieldMetadataMaps.byUniversalIdentifier[
        NAME_FIELD_UNIVERSAL_IDENTIFIER
      ]?.isSearchable,
    ).toBe(true);
    expect(
      healedFlatFieldMetadataMaps.byUniversalIdentifier[
        NOTE_FIELD_UNIVERSAL_IDENTIFIER
      ]?.isSearchable,
    ).toBe(false);
  }, 60000);
});
