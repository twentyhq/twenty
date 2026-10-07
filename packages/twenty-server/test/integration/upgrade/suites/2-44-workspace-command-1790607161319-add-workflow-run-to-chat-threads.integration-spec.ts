import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  LEGACY_CHAT_THREAD_WORKFLOW_RUN_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_CHAT_THREAD_WORKFLOW_RUN_INDEX_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_RUN_AGENT_CHAT_THREADS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-44/constants/legacy-chat-thread-workflow-run-universal-identifiers.constant';
import { type AddAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791405449480-add-agent-chat-channels.command';
import { type SeedDefaultAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791406932794-seed-default-agent-chat-channels.command';
import { type AddWorkflowRunToChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607161319-add-workflow-run-to-chat-threads.command';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const FIELD_UNIVERSAL_IDENTIFIERS = [
  LEGACY_CHAT_THREAD_WORKFLOW_RUN_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_RUN_AGENT_CHAT_THREADS_FIELD_UNIVERSAL_IDENTIFIER,
];

// 2.46 dropped the run link from the standard objects, so a workspace
// upgrading past 2.44 keeps its threads unlinked, as a fresh install leaves
// them. They read through their channel since 2.46, which this command
// leaves alone on the way up.
describe('2-44 workspace command 1790607161319 - AddWorkflowRunToChatThreadsCommand (integration)', () => {
  let command: AddWorkflowRunToChatThreadsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readState = async () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    return {
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.filter((universalIdentifier) =>
        isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
        ),
      ).length,
      hasIndex: isDefined(
        flatIndexMaps.byUniversalIdentifier[
          LEGACY_CHAT_THREAD_WORKFLOW_RUN_INDEX_UNIVERSAL_IDENTIFIER
        ],
      ),
      readability: threadObject?.readability,
      readabilityParentFieldUniversalIdentifiers:
        threadObject?.readabilityParentFieldUniversalIdentifiers,
    };
  };

  const UNLINKED_STATE = {
    fieldCount: 0,
    hasIndex: false,
    readability: MetadataReadability.INHERITED,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECTS.agentChatThread.fields.channel.universalIdentifier,
    ],
  };

  // Down reverts threads to PRIVATE, which would cut channel members off
  // their chats in the suites that follow
  afterAll(async () => {
    await getAppProviderByClassName<AddAgentChatChannelsCommand>(
      'AddAgentChatChannelsCommand',
    ).up(RUN_ON_WORKSPACE_ARGS);
    await getAppProviderByClassName<SeedDefaultAgentChatChannelsCommand>(
      'SeedDefaultAgentChatChannelsCommand',
    ).up(RUN_ON_WORKSPACE_ARGS);
  });

  beforeAll(() => {
    command = getAppProviderByClassName<AddWorkflowRunToChatThreadsCommand>(
      'AddWorkflowRunToChatThreadsCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  it('starts from a workspace without the run link', async () => {
    expect(await readState()).toEqual(UNLINKED_STATE);
  });

  it('no longer links threads to runs', async () => {
    await runCommand();

    expect(await readState()).toEqual(UNLINKED_STATE);
  });

  it('reads threads through their own grants again on down', async () => {
    await workspaceOrmManager.executeInWorkspaceContext(
      () => command.down(RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

    expect(await readState()).toEqual({
      ...UNLINKED_STATE,
      readability: MetadataReadability.PRIVATE,
      readabilityParentFieldUniversalIdentifiers: null,
    });
  });
});
