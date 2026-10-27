import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('Standard object readability', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const findStandardFlatObjectMetadata = (
    objectName: keyof typeof STANDARD_OBJECTS,
  ): FlatObjectMetadata | undefined =>
    Object.values(
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (flatObjectMetadata) =>
          flatObjectMetadata.universalIdentifier ===
          STANDARD_OBJECTS[objectName].universalIdentifier,
      );

  it('declares workflowRun PRIVATE and leaves workflow and workflowVersion OPEN', () => {
    expect(findStandardFlatObjectMetadata('workflowRun')).toMatchObject({
      readability: MetadataReadability.PRIVATE,
    });
    expect(findStandardFlatObjectMetadata('workflow')).toMatchObject({
      readability: MetadataReadability.OPEN,
    });
    expect(findStandardFlatObjectMetadata('workflowVersion')).toMatchObject({
      readability: MetadataReadability.OPEN,
    });
  });

  it.each(['agentChatThread', 'agentChatThreadParticipant'] as const)(
    'declares %s PRIVATE, read through its own grants',
    (objectName) => {
      expect(findStandardFlatObjectMetadata(objectName)).toMatchObject({
        readability: MetadataReadability.PRIVATE,
      });
    },
  );
});
