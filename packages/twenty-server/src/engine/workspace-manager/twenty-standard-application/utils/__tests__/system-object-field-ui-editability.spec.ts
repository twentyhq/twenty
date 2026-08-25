import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const USER_EDITABLE_SYSTEM_OBJECT_FIELDS = ['callRecording.summary'];

describe('System object field UI editability', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const systemFlatObjectMetadatas = Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatObjectMetadata) => flatObjectMetadata.isSystem);

  const systemObjectNameByObjectMetadataId = new Map(
    systemFlatObjectMetadatas.map((flatObjectMetadata) => [
      flatObjectMetadata.id,
      flatObjectMetadata.nameSingular,
    ]),
  );

  it('declares isUIEditable: false on every user-facing field of a system object', () => {
    const undeclaredFields = Object.values(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatFieldMetadata) =>
        systemObjectNameByObjectMetadataId.has(
          flatFieldMetadata.objectMetadataId,
        ),
      )
      .filter((flatFieldMetadata) => !flatFieldMetadata.isSystem)
      .filter((flatFieldMetadata) => flatFieldMetadata.isUIEditable !== false)
      .map(
        (flatFieldMetadata) =>
          `${systemObjectNameByObjectMetadataId.get(
            flatFieldMetadata.objectMetadataId,
          )}.${flatFieldMetadata.name}`,
      );

    expect(undeclaredFields.sort()).toEqual(USER_EDITABLE_SYSTEM_OBJECT_FIELDS);
  });
});
