import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('ShortLink standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });
  const shortLink =
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.shortLink.universalIdentifier
    ];

  it('creates a workspace owned system object with explicit URL meanings', () => {
    expect(shortLink).toMatchObject({
      nameSingular: 'shortLink',
      isSystem: true,
      isUICreatable: false,
      isUIEditable: false,
      readability: MetadataReadability.SYSTEM,
      writability: MetadataWritability.SYSTEM,
    });

    const fields = Object.values(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    expect(
      fields
        .filter((field) => field.objectMetadataId === shortLink?.id)
        .map((field) => field.name),
    ).toEqual(
      expect.arrayContaining(['templateUrl', 'resolvedUrl', 'identityHash']),
    );
  });

  it('uniquely indexes the link identity within each workspace', () => {
    const index =
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.shortLink.indexes.identityHashUniqueIndex
          .universalIdentifier
      ];

    expect(index).toMatchObject({ isUnique: true });
    expect(index?.flatIndexFieldMetadatas).toHaveLength(1);
    expect(index?.flatIndexFieldMetadatas[0].fieldMetadataId).toBe(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.shortLink.fields.identityHash.universalIdentifier
      ]?.id,
    );
  });
});
