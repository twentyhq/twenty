import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type UpdateSettingsGoToCommandLabelsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795732352221-update-settings-go-to-command-labels.command';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const { universalIdentifier: EXPERIENCE_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsExperience;

const { universalIdentifier: MEMBERS_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsMembers;

const FORMER_LABEL_BY_UNIVERSAL_IDENTIFIER = {
  [EXPERIENCE_UNIVERSAL_IDENTIFIER]: 'Go to Experience Settings',
  [MEMBERS_UNIVERSAL_IDENTIFIER]: 'Go to Members Settings',
};

const CURRENT_LABEL_BY_UNIVERSAL_IDENTIFIER = {
  [EXPERIENCE_UNIVERSAL_IDENTIFIER]: 'Go to Experience',
  [MEMBERS_UNIVERSAL_IDENTIFIER]: 'Go to Members',
};

describe('2-65 workspace command 1795732352221 - UpdateSettingsGoToCommandLabelsCommand (integration)', () => {
  let command: UpdateSettingsGoToCommandLabelsCommand;
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
    labelByUniversalIdentifier: Record<string, string>,
  ) => {
    for (const [universalIdentifier, label] of Object.entries(
      labelByUniversalIdentifier,
    )) {
      await getCoreRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      ).update(
        { universalIdentifier, workspaceId: SEED_APPLE_WORKSPACE_ID },
        { label },
      );
    }

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatCommandMenuItemMaps',
    ]);
  };

  const findLabel = async (universalIdentifier: string) => {
    const { label } = await getCoreRepository<CommandMenuItemEntity>(
      CommandMenuItemEntity,
    ).findOneOrFail({
      where: { universalIdentifier, workspaceId: SEED_APPLE_WORKSPACE_ID },
    });

    return label;
  };

  beforeAll(() => {
    command = getAppProviderByClassName<UpdateSettingsGoToCommandLabelsCommand>(
      'UpdateSettingsGoToCommandLabelsCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
  });

  afterAll(async () => {
    await setLabels(CURRENT_LABEL_BY_UNIVERSAL_IDENTIFIER);
  });

  it('keeps the former labels on a dry run', async () => {
    await setLabels(FORMER_LABEL_BY_UNIVERSAL_IDENTIFIER);

    await runCommand({ dryRun: true });

    expect(await findLabel(EXPERIENCE_UNIVERSAL_IDENTIFIER)).toBe(
      'Go to Experience Settings',
    );
    expect(await findLabel(MEMBERS_UNIVERSAL_IDENTIFIER)).toBe(
      'Go to Members Settings',
    );
  });

  it('renames the former labels and is a no-op on a second run', async () => {
    await setLabels(FORMER_LABEL_BY_UNIVERSAL_IDENTIFIER);

    await runCommand();
    await runCommand();

    expect(await findLabel(EXPERIENCE_UNIVERSAL_IDENTIFIER)).toBe(
      'Go to Experience',
    );
    expect(await findLabel(MEMBERS_UNIVERSAL_IDENTIFIER)).toBe('Go to Members');
  });

  it('keeps a customized label', async () => {
    await setLabels({
      [EXPERIENCE_UNIVERSAL_IDENTIFIER]: 'Open experience',
      [MEMBERS_UNIVERSAL_IDENTIFIER]: 'Go to Members Settings',
    });

    await runCommand();

    expect(await findLabel(EXPERIENCE_UNIVERSAL_IDENTIFIER)).toBe(
      'Open experience',
    );
    expect(await findLabel(MEMBERS_UNIVERSAL_IDENTIFIER)).toBe('Go to Members');
  });
});
