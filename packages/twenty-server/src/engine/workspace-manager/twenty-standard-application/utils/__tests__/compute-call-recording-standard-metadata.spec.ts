import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

// Builds the full standard metadata graph (objects -> fields -> indexes -> views).
// This is where a dangling relation target or an index on a missing field would throw,
// so it validates that CallRecording and its association object are wired end-to-end.
describe('CallRecording standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it('builds the callRecording and association objects', () => {
    const { byUniversalIdentifier } = allFlatEntityMaps.flatObjectMetadataMaps;

    expect(
      byUniversalIdentifier[STANDARD_OBJECTS.callRecording.universalIdentifier],
    ).toBeDefined();
    expect(
      byUniversalIdentifier[
        STANDARD_OBJECTS.callRecordingCalendarEventAssociation
          .universalIdentifier
      ],
    ).toBeDefined();
  });

  it('marks the callRecording object as system', () => {
    const callRecording =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.universalIdentifier
      ];

    expect(callRecording?.isSystem).toBe(true);
  });

  it('enforces a unique index on meetingOccurrenceKey', () => {
    const meetingOccurrenceKeyIndex =
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.indexes.meetingOccurrenceKeyIndex
          .universalIdentifier
      ];

    expect(meetingOccurrenceKeyIndex).toBeDefined();
    expect(meetingOccurrenceKeyIndex?.isUnique).toBe(true);
  });
});
