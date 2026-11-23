import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { WORKFLOW_PRIVACY_COMMAND_MENU_ITEM_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/2-62/constants/move-workflow-privacy-command-menu-items-to-is-private.constant';
import { type MoveWorkflowPrivacyCommandMenuItemsToIsPrivateCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795427773230-move-workflow-privacy-command-menu-items-to-is-private.command';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const [MAKE_PRIVATE, SHARE_WITH_WORKSPACE] =
  WORKFLOW_PRIVACY_COMMAND_MENU_ITEM_EXPRESSIONS;

const CUSTOM_EXPRESSION = 'numberOfSelectedRecords == 1';

describe('2-62 workspace command - move workflow privacy command menu items to isPrivate (integration)', () => {
  let command: MoveWorkflowPrivacyCommandMenuItemsToIsPrivateCommand;

  const runCommand = ({ dryRun = false }: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const setExpressions = async (
    expressionByUniversalIdentifier: Record<string, string>,
  ) => {
    for (const [
      universalIdentifier,
      conditionalAvailabilityExpression,
    ] of Object.entries(expressionByUniversalIdentifier)) {
      await getCoreRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      ).update(
        { universalIdentifier, workspaceId: SEED_APPLE_WORKSPACE_ID },
        { conditionalAvailabilityExpression },
      );
    }

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatCommandMenuItemMaps',
    ]);
  };

  const findExpression = async (universalIdentifier: string) =>
    (
      await getCoreRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      ).findOneOrFail({
        where: { universalIdentifier, workspaceId: SEED_APPLE_WORKSPACE_ID },
      })
    ).conditionalAvailabilityExpression;

  const setLegacyExpressions = () =>
    setExpressions({
      [MAKE_PRIVATE.universalIdentifier]: MAKE_PRIVATE.legacyExpression,
      [SHARE_WITH_WORKSPACE.universalIdentifier]:
        SHARE_WITH_WORKSPACE.legacyExpression,
    });

  beforeAll(() => {
    command =
      getAppProviderByClassName<MoveWorkflowPrivacyCommandMenuItemsToIsPrivateCommand>(
        'MoveWorkflowPrivacyCommandMenuItemsToIsPrivateCommand',
      );
  });

  afterAll(async () => {
    await setExpressions({
      [MAKE_PRIVATE.universalIdentifier]: MAKE_PRIVATE.expression,
      [SHARE_WITH_WORKSPACE.universalIdentifier]:
        SHARE_WITH_WORKSPACE.expression,
    });
  });

  it('keeps the visibility expressions on a dry run', async () => {
    await setLegacyExpressions();

    await runCommand({ dryRun: true });

    expect(await findExpression(MAKE_PRIVATE.universalIdentifier)).toBe(
      MAKE_PRIVATE.legacyExpression,
    );
    expect(await findExpression(SHARE_WITH_WORKSPACE.universalIdentifier)).toBe(
      SHARE_WITH_WORKSPACE.legacyExpression,
    );
  });

  it('moves both expressions to isPrivate and is a no-op on a second run', async () => {
    await setLegacyExpressions();

    await runCommand();
    await runCommand();

    expect(await findExpression(MAKE_PRIVATE.universalIdentifier)).toBe(
      MAKE_PRIVATE.expression,
    );
    expect(await findExpression(SHARE_WITH_WORKSPACE.universalIdentifier)).toBe(
      SHARE_WITH_WORKSPACE.expression,
    );
  });

  it('keeps an expression that differs from the legacy one', async () => {
    await setLegacyExpressions();
    await setExpressions({
      [MAKE_PRIVATE.universalIdentifier]: CUSTOM_EXPRESSION,
    });

    await runCommand();

    expect(await findExpression(MAKE_PRIVATE.universalIdentifier)).toBe(
      CUSTOM_EXPRESSION,
    );
    expect(await findExpression(SHARE_WITH_WORKSPACE.universalIdentifier)).toBe(
      SHARE_WITH_WORKSPACE.expression,
    );
  });
});
