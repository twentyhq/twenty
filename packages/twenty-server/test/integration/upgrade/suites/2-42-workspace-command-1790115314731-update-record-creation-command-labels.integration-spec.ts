import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type UpdateRecordCreationCommandLabelsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790115314731-update-record-creation-command-labels.command';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const { universalIdentifier: CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.createNewRecord;

const { universalIdentifier: COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned;

const FORMER_LABELS = {
  label: 'Create new {objectLabelSingular}',
  shortLabel: 'New {objectLabelSingular}',
};

const CURRENT_LABELS = {
  label: 'Create {objectLabelSingular}',
  shortLabel: 'Create',
};

const FORMER_CAMPAIGN_LABELS = {
  label: 'Create new Campaign',
  shortLabel: 'New Campaign',
};

const CURRENT_CAMPAIGN_LABELS = {
  label: 'Create Campaign',
  shortLabel: 'Create',
};

type CommandMenuItemLabels = {
  label: string;
  shortLabel: string | null;
};

describe('2-42 workspace command 1790115314731 - UpdateRecordCreationCommandLabelsCommand (integration)', () => {
  let command: UpdateRecordCreationCommandLabelsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const runCommand = ({ dryRun = false }: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        command.runOnWorkspace({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          options: { dryRun },
          index: 0,
          total: 1,
        }),
      authContext,
    );

  const setLabels = async (
    labelsByUniversalIdentifier: Record<string, CommandMenuItemLabels>,
  ) => {
    for (const [universalIdentifier, labels] of Object.entries(
      labelsByUniversalIdentifier,
    )) {
      await getCoreRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      ).update(
        { universalIdentifier, workspaceId: SEED_APPLE_WORKSPACE_ID },
        labels,
      );
    }

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatCommandMenuItemMaps',
    ]);
  };

  const findLabels = async (universalIdentifier: string) => {
    const { label, shortLabel } =
      await getCoreRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      ).findOneOrFail({
        where: { universalIdentifier, workspaceId: SEED_APPLE_WORKSPACE_ID },
      });

    return { label, shortLabel };
  };

  beforeAll(() => {
    command =
      getAppProviderByClassName<UpdateRecordCreationCommandLabelsCommand>(
        'UpdateRecordCreationCommandLabelsCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
  });

  afterAll(async () => {
    await setLabels({
      [CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER]: CURRENT_LABELS,
      [COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER]: CURRENT_CAMPAIGN_LABELS,
    });
  });

  it('keeps the former labels on a dry run', async () => {
    await setLabels({
      [CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER]: FORMER_LABELS,
      [COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER]: FORMER_CAMPAIGN_LABELS,
    });

    await runCommand({ dryRun: true });

    expect(await findLabels(CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER)).toEqual(
      FORMER_LABELS,
    );
    expect(await findLabels(COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER)).toEqual(
      FORMER_CAMPAIGN_LABELS,
    );
  });

  it('renames the former labels and is a no-op on a second run', async () => {
    await setLabels({
      [CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER]: FORMER_LABELS,
      [COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER]: FORMER_CAMPAIGN_LABELS,
    });

    await runCommand();
    await runCommand();

    expect(await findLabels(CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER)).toEqual(
      CURRENT_LABELS,
    );
    expect(await findLabels(COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER)).toEqual(
      CURRENT_CAMPAIGN_LABELS,
    );
  });

  it('keeps a customized short label', async () => {
    await setLabels({
      [CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER]: {
        label: FORMER_LABELS.label,
        shortLabel: 'Add',
      },
    });

    await runCommand();

    expect(await findLabels(CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER)).toEqual({
      label: CURRENT_LABELS.label,
      shortLabel: 'Add',
    });
  });
});
