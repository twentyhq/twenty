import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { LEGACY_CHAT_THREAD_WORKFLOW_STEP_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-44/constants/legacy-chat-thread-workflow-step-id-field-universal-identifier.constant';
import { type DropChatThreadWorkflowStepIdCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790677027260-drop-chat-thread-workflow-step-id.command';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-44 workspace command 1790677027260 - DropChatThreadWorkflowStepIdCommand (integration)', () => {
  let command: DropChatThreadWorkflowStepIdCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;

  const inWorkspace = (callback: () => Promise<void>) =>
    workspaceOrmManager.executeInWorkspaceContext(
      callback,
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    inWorkspace(() =>
      command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
    );

  const readState = async () => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);
    const columns: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'agentChatThread' AND column_name = 'workflowStepId'`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );

    return {
      hasField: isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_CHAT_THREAD_WORKFLOW_STEP_ID_FIELD_UNIVERSAL_IDENTIFIER
        ],
      ),
      hasColumn: columns.length > 0,
    };
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<DropChatThreadWorkflowStepIdCommand>(
      'DropChatThreadWorkflowStepIdCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await runCommand();
  });

  it('is a no-op on a workspace that never had the field', async () => {
    expect(await readState()).toEqual({ hasField: false, hasColumn: false });

    await runCommand();

    expect(await readState()).toEqual({ hasField: false, hasColumn: false });
  });

  // down puts the field back as 2.44 first shipped it, which is also the
  // state of a workspace that ran add-workflow-run-to-chat-threads early.
  it('restores the field on down', async () => {
    await inWorkspace(() => command.down(RUN_ON_WORKSPACE_ARGS));

    expect(await readState()).toEqual({ hasField: true, hasColumn: true });
  });

  it('changes nothing on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await readState()).toEqual({ hasField: true, hasColumn: true });
  });

  it('drops the field and its column from a workspace that has it', async () => {
    await runCommand();

    expect(await readState()).toEqual({ hasField: false, hasColumn: false });
  });

  it('is a no-op when run again', async () => {
    await runCommand();

    expect(await readState()).toEqual({ hasField: false, hasColumn: false });
  });
});
