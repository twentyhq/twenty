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

const FORMER_LABELS = {
  label: 'Create new {objectLabelSingular}',
  shortLabel: 'New {objectLabelSingular}',
};

const CURRENT_LABELS = {
  label: 'Create {objectLabelSingular}',
  shortLabel: 'Create',
};

const CREATE_NEW_RECORD_COMMAND_WHERE = {
  universalIdentifier:
    STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier,
  workspaceId: SEED_APPLE_WORKSPACE_ID,
};

describe('2-42 workspace command 1790115314731 - UpdateRecordCreationCommandLabelsCommand (integration)', () => {
  let command: UpdateRecordCreationCommandLabelsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const runCommand = ({
    direction = 'up',
    dryRun = false,
  }: {
    direction?: 'up' | 'down';
    dryRun?: boolean;
  } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        command[direction]({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          options: { dryRun },
          index: 0,
          total: 1,
        }),
      authContext,
    );

  const setLabels = async (labels: {
    label: string;
    shortLabel: string | null;
  }) => {
    await getCoreRepository<CommandMenuItemEntity>(
      CommandMenuItemEntity,
    ).update(CREATE_NEW_RECORD_COMMAND_WHERE, labels);

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatCommandMenuItemMaps',
    ]);
  };

  const findLabels = async () => {
    const { label, shortLabel } =
      await getCoreRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      ).findOneOrFail({ where: CREATE_NEW_RECORD_COMMAND_WHERE });

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
    await setLabels(CURRENT_LABELS);
  });

  it('keeps the former labels on a dry run', async () => {
    await setLabels(FORMER_LABELS);

    await runCommand({ dryRun: true });

    expect(await findLabels()).toEqual(FORMER_LABELS);
  });

  it('renames the former labels and is a no-op on a second run', async () => {
    await setLabels(FORMER_LABELS);

    await runCommand();
    await runCommand();

    expect(await findLabels()).toEqual(CURRENT_LABELS);
  });

  it('keeps a customized short label', async () => {
    await setLabels({ label: FORMER_LABELS.label, shortLabel: 'Add' });

    await runCommand();

    expect(await findLabels()).toEqual({
      label: CURRENT_LABELS.label,
      shortLabel: 'Add',
    });
  });

  it('restores the former labels when rolled back', async () => {
    await setLabels(CURRENT_LABELS);

    await runCommand({ direction: 'down' });

    expect(await findLabels()).toEqual(FORMER_LABELS);
  });
});
