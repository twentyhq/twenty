/* @license Enterprise */

import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const computeStandardFlatEntityMaps = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: NOW,
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
  }).allFlatEntityMaps;

describe('Standard related record paths', () => {
  const {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatRelatedRecordPathMaps,
  } = computeStandardFlatEntityMaps();

  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const flatRelatedRecordPaths = Object.values(
    flatRelatedRecordPathMaps.byUniversalIdentifier,
  ).filter(isDefined);

  it('follows each readability parent relation from the parent side', () => {
    const expectedPaths = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap(
        (flatObjectMetadata) =>
          flatObjectMetadata.readabilityParentFieldUniversalIdentifiers ?? [],
      )
      .map(
        (universalIdentifier) =>
          flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined)
      .flatMap((declaredFlatFieldMetadata) =>
        isDefined(declaredFlatFieldMetadata.morphId)
          ? flatFieldMetadatas.filter(
              (flatFieldMetadata) =>
                flatFieldMetadata.objectMetadataUniversalIdentifier ===
                  declaredFlatFieldMetadata.objectMetadataUniversalIdentifier &&
                flatFieldMetadata.morphId ===
                  declaredFlatFieldMetadata.morphId &&
                !isMorphRelationHead(flatFieldMetadata),
            )
          : [declaredFlatFieldMetadata],
      )
      .map((flatFieldMetadata) => ({
        objectMetadataUniversalIdentifier:
          flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
        firstFieldMetadataUniversalIdentifier:
          flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
      }));

    const actualPaths = flatRelatedRecordPaths.map(
      ({
        objectMetadataUniversalIdentifier,
        firstFieldMetadataUniversalIdentifier,
        secondFieldMetadataUniversalIdentifier,
      }) => {
        expect(secondFieldMetadataUniversalIdentifier).toBeNull();

        return {
          objectMetadataUniversalIdentifier,
          firstFieldMetadataUniversalIdentifier,
        };
      },
    );

    expect(actualPaths).toHaveLength(expectedPaths.length);
    expect(actualPaths).toEqual(expect.arrayContaining(expectedPaths));
  });

  it('keeps the same universal identifiers across computations', () => {
    const { flatRelatedRecordPathMaps: recomputedFlatRelatedRecordPathMaps } =
      computeStandardFlatEntityMaps();

    expect(
      Object.keys(recomputedFlatRelatedRecordPathMaps.byUniversalIdentifier),
    ).toEqual(Object.keys(flatRelatedRecordPathMaps.byUniversalIdentifier));
  });
});
