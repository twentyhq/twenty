import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'twenty-shared/metadata';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

// Every target join column on these objects is filtered on by the timeline,
// attachment and activity target queries, and each target is declared by hand
// in three separate places. Without this guard a new target ships unindexed.
describe('polymorphic standard object index coverage', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const indexedFieldMetadataIds = new Set(
    Object.values(allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier)
      .filter(isDefined)
      .flatMap((flatIndex) =>
        flatIndex.flatIndexFieldMetadatas.map(
          (flatIndexFieldMetadata) => flatIndexFieldMetadata.fieldMetadataId,
        ),
      ),
  );

  it.each([...DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS])(
    'indexes every many to one target join column on %s',
    (objectNameSingular) => {
      const flatObjectMetadata = Object.values(
        allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .find((candidate) => candidate.nameSingular === objectNameSingular);

      expect(flatObjectMetadata).toBeDefined();

      const unindexedFieldNames = Object.values(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(isMorphOrRelationFlatFieldMetadata)
        .filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.objectMetadataId === flatObjectMetadata?.id &&
            flatFieldMetadata.settings?.relationType ===
              RelationType.MANY_TO_ONE &&
            !indexedFieldMetadataIds.has(flatFieldMetadata.id),
        )
        .map((flatFieldMetadata) => flatFieldMetadata.name);

      expect(unindexedFieldNames).toEqual([]);
    },
  );
});
