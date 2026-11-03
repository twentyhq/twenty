import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type RemoveMessageCampaignFlagCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266150123-remove-message-campaign-flag.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const FLAG = 'featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED';

const getNavigationUniversalIdentifier = (objectUniversalIdentifier: string) =>
  getSystemNavigationCommandMenuItemUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
  });

const SELECTED_DRAFT_OR_SCHEDULED_CAMPAIGN_EXPRESSION =
  'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "DRAFT") or everyEquals(selectedRecords, "status", "SCHEDULED")) and noneDefined(selectedRecords, "deletedAt")';

const SELECTED_UPDATABLE_RECORD_EXPRESSION =
  'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords';

const LEGACY_EXPRESSION_BY_UNIVERSAL_IDENTIFIER: Record<string, string> = {
  [STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned.universalIdentifier]:
    'pageType == "INDEX_PAGE"',
  [STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier]:
    SELECTED_DRAFT_OR_SCHEDULED_CAMPAIGN_EXPRESSION,
  [STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest.universalIdentifier]:
    SELECTED_DRAFT_OR_SCHEDULED_CAMPAIGN_EXPRESSION,
  [STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign.universalIdentifier]:
    'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "SCHEDULED") or everyEquals(selectedRecords, "status", "SENDING")) and noneDefined(selectedRecords, "deletedAt")',
  [STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign.universalIdentifier]:
    SELECTED_UPDATABLE_RECORD_EXPRESSION,
  [STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier]:
    SELECTED_UPDATABLE_RECORD_EXPRESSION,
  [STANDARD_COMMAND_MENU_ITEMS.addToMessageList.universalIdentifier]:
    'targetObjectWritePermissions.messageListMember and numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and (isSelectAll or noneDefined(selectedRecords, "deletedAt"))',
  [STANDARD_COMMAND_MENU_ITEMS.addViewToMessageList.universalIdentifier]:
    'targetObjectWritePermissions.messageListMember and pageType == "INDEX_PAGE" and not hasAnySoftDeleteFilterOnView',
  [getNavigationUniversalIdentifier(
    STANDARD_OBJECTS.messageCampaign.universalIdentifier,
  )]: 'targetObjectReadPermissions.messageCampaign',
  [getNavigationUniversalIdentifier(
    STANDARD_OBJECTS.messageList.universalIdentifier,
  )]: 'targetObjectReadPermissions.messageList',
};

const SEEDED_EXPRESSION_BY_UNIVERSAL_IDENTIFIER: Record<string, null> =
  Object.fromEntries(
    Object.keys(LEGACY_EXPRESSION_BY_UNIVERSAL_IDENTIFIER).map(
      (universalIdentifier) => [universalIdentifier, null],
    ),
  );

type CommandMenuItemRow = {
  universalIdentifier: string;
  label: string;
  isPinned: boolean;
  isActive: boolean;
  position: number;
  availabilityType: string;
  conditionalAvailabilityExpression: string | null;
  conditionalPinnedExpression: string | null;
  overrides: unknown;
};

const readCommandMenuItems = async (): Promise<CommandMenuItemRow[]> =>
  global.testDataSource.query(
    `SELECT "universalIdentifier", "label", "isPinned", "isActive", "position",
            "availabilityType", "conditionalAvailabilityExpression",
            "conditionalPinnedExpression", "overrides"
     FROM core."commandMenuItem"
     WHERE "workspaceId" = $1
     ORDER BY "universalIdentifier"`,
    [SEED_APPLE_WORKSPACE_ID],
  );

describe('2-54 workspace command - remove message campaign flag (integration)', () => {
  let command: RemoveMessageCampaignFlagCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const setConditionalAvailabilityExpressions = async (
    expressionByUniversalIdentifier: Record<string, string | null>,
  ) => {
    for (const [universalIdentifier, expression] of Object.entries(
      expressionByUniversalIdentifier,
    )) {
      await global.testDataSource.query(
        `UPDATE core."commandMenuItem"
         SET "conditionalAvailabilityExpression" = $3
         WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
        [SEED_APPLE_WORKSPACE_ID, universalIdentifier, expression],
      );
    }
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatCommandMenuItemMaps'],
    );
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<RemoveMessageCampaignFlagCommand>(
      'RemoveMessageCampaignFlagCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    await setConditionalAvailabilityExpressions(
      LEGACY_EXPRESSION_BY_UNIVERSAL_IDENTIFIER,
    );
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
    await setConditionalAvailabilityExpressions(
      SEEDED_EXPRESSION_BY_UNIVERSAL_IDENTIFIER,
    );
  });

  it('puts the flag back on down and restores every command menu item exactly on up', async () => {
    const commandMenuItemsBefore = await readCommandMenuItems();

    expect(
      commandMenuItemsBefore.filter(({ conditionalAvailabilityExpression }) =>
        conditionalAvailabilityExpression?.includes(FLAG),
      ),
    ).toEqual([]);

    await command.down(RUN_ON_WORKSPACE_ARGS);

    const commandMenuItemsAfterDown = await readCommandMenuItems();
    const flaggedUniversalIdentifiers = commandMenuItemsAfterDown
      .filter(({ conditionalAvailabilityExpression }) =>
        conditionalAvailabilityExpression?.includes(FLAG),
      )
      .map(({ universalIdentifier }) => universalIdentifier);

    expect(flaggedUniversalIdentifiers).toHaveLength(11);
    expect(
      commandMenuItemsAfterDown.filter(
        ({ universalIdentifier }) =>
          !flaggedUniversalIdentifiers.includes(universalIdentifier),
      ),
    ).toEqual(
      commandMenuItemsBefore.filter(
        ({ universalIdentifier }) =>
          !flaggedUniversalIdentifiers.includes(universalIdentifier),
      ),
    );

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readCommandMenuItems()).toEqual(commandMenuItemsBefore);

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readCommandMenuItems()).toEqual(commandMenuItemsBefore);
  });
});
