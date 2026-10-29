import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddChatMentionResolutionCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793286392541-add-chat-mention-resolution.command';
import { type AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};
const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const MENTIONS_RESOLVED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.mentionsResolvedAt
    .universalIdentifier;

describe('2-54 workspace command - add chat mention resolution (integration)', () => {
  let command: AddChatMentionResolutionCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let sharingService: AgentChatSharingService;

  const findResolutionMetadata = async () => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);
    const columns: { column_name: string }[] =
      await global.testDataSource.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'agentChatThreadParticipant'
           AND column_name = 'mentionsResolvedAt'`,
        [SCHEMA],
      );

    return {
      hasField: isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          MENTIONS_RESOLVED_AT_FIELD_UNIVERSAL_IDENTIFIER
        ],
      ),
      hasColumn: columns.length === 1,
    };
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddChatMentionResolutionCommand>(
      'AddChatMentionResolutionCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    sharingService = getAppProviderByClassName<AgentChatSharingService>(
      'AgentChatSharingService',
    );
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('removes the field and column on down, and fences participant access', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findResolutionMetadata()).toEqual({
      hasField: false,
      hasColumn: false,
    });
    await expect(
      sharingService.getParticipantObjectMetadataId(SEED_APPLE_WORKSPACE_ID),
    ).rejects.toMatchObject({ code: AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS });
  });

  it('leaves the field absent on a dry run', async () => {
    await command.up({ ...RUN_ON_WORKSPACE_ARGS, options: { dryRun: true } });

    expect(await findResolutionMetadata()).toEqual({
      hasField: false,
      hasColumn: false,
    });
  });

  it('adds the field and lifts the participant access fence', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findResolutionMetadata()).toEqual({
      hasField: true,
      hasColumn: true,
    });
    await expect(
      sharingService.getParticipantObjectMetadataId(SEED_APPLE_WORKSPACE_ID),
    ).resolves.toEqual(expect.any(String));
  });
});
