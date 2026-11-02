import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RemoveMessageCampaignFlagCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266150123-remove-message-campaign-flag.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const FLAG = 'featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED';

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

  beforeAll(() => {
    command = getAppProviderByClassName<RemoveMessageCampaignFlagCommand>(
      'RemoveMessageCampaignFlagCommand',
    );
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
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
