import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('standard icon metadata', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it.each([
    STANDARD_OBJECTS.timelineActivity.fields.workspaceMember
      .universalIdentifier,
    STANDARD_OBJECTS.messageParticipant.fields.workspaceMember
      .universalIdentifier,
    STANDARD_OBJECTS.blocklist.fields.workspaceMember.universalIdentifier,
    STANDARD_OBJECTS.workspaceMember.fields.name.universalIdentifier,
    STANDARD_OBJECTS.workspaceMember.fields.userId.universalIdentifier,
  ])(
    'uses the canonical member icon for field %s',
    (fieldUniversalIdentifier) => {
      expect(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          fieldUniversalIdentifier
        ]?.icon,
      ).toBe('IconUsers');
    },
  );

  it('keeps the time-zone field icon available for dynamic resolution', () => {
    expect(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workspaceMember.fields.timeZone.universalIdentifier
      ]?.icon,
    ).toBe('IconTimezone');
  });

  it('uses the copy-plus icon for the duplicate-dashboard command', () => {
    expect(STANDARD_COMMAND_MENU_ITEMS.duplicateDashboard.icon).toBe(
      'IconCopyPlus',
    );
  });
});
