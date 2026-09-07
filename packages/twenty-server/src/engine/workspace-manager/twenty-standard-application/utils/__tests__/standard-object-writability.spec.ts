import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

// Records of these objects are only ever written by the platform itself:
// sync bookkeeping rows and workflow trigger registrations. timelineActivity
// stays OPEN because merging records reparents its rows under the caller.
const SYSTEM_WRITABILITY_STANDARD_OBJECT_NAMES = [
  'calendarChannelEventAssociation',
  'messageChannelMessageAssociation',
  'messageChannelMessageAssociationMessageFolder',
  'workflowAutomatedTrigger',
];

describe('Standard object writability', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const standardFlatObjectMetadatas = Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  it('marks platform-owned objects SYSTEM', () => {
    const systemObjectNames = standardFlatObjectMetadatas
      .filter(
        (flatObjectMetadata) =>
          flatObjectMetadata.writability === MetadataWritability.SYSTEM,
      )
      .map((flatObjectMetadata) => flatObjectMetadata.nameSingular)
      .sort();

    expect(systemObjectNames).toEqual(SYSTEM_WRITABILITY_STANDARD_OBJECT_NAMES);
  });

  it('leaves every other standard object OPEN', () => {
    const otherWritabilities = new Set(
      standardFlatObjectMetadatas
        .filter(
          (flatObjectMetadata) =>
            !SYSTEM_WRITABILITY_STANDARD_OBJECT_NAMES.includes(
              flatObjectMetadata.nameSingular,
            ),
        )
        .map((flatObjectMetadata) => flatObjectMetadata.writability),
    );

    expect(standardFlatObjectMetadatas.length).toBeGreaterThan(
      SYSTEM_WRITABILITY_STANDARD_OBJECT_NAMES.length,
    );
    expect([...otherWritabilities]).toEqual([MetadataWritability.OPEN]);
  });
});
