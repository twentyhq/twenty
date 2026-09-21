import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type ChatThreadShareTargetInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-thread-sharing.dto';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const READ_THREAD = parse(`query ReadSharedThread($id: UUID!) {
  chatThread(id: $id) { id title canManage }
}`);
const SET_SHARE =
  parse(`mutation SetThreadShare($threadId: UUID!, $target: ChatThreadShareTargetInput!, $enabled: Boolean!) {
  setChatThreadShare(threadId: $threadId, target: $target, enabled: $enabled) { isEnabled }
}`);

describe('Conversation sharing through the authenticated API', () => {
  it.each(['member', 'role', 'everyone'])(
    'grants read-only %s access and denies it immediately after revocation',
    async (audience) => {
      const workspaceId = SEED_APPLE_WORKSPACE_ID;
      const cache = getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      );
      const { featureFlagsMap, userWorkspaceRoleMap } =
        await cache.getOrRecompute(workspaceId, [
          'featureFlagsMap',
          'userWorkspaceRoleMap',
        ]);
      const previousEnabled =
        featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] === true;
      const roleId = userWorkspaceRoleMap[USER_WORKSPACE_DATA_SEED_IDS.JONY];
      if (!isDefined(roleId)) {
        throw new Error('Seeded recipient role is missing');
      }
      const target: ChatThreadShareTargetInput =
        audience === 'member'
          ? { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY }
          : audience === 'role'
            ? { roleId }
            : { everyone: true };
      const chatService =
        getAppProviderByClassName<AgentChatService>('AgentChatService');
      const threadId = randomUUID();
      const owner = {
        workspaceId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      };
      await chatService.createThread({
        ...owner,
        id: threadId,
        title: 'Private sharing regression',
      });
      const read = () =>
        makeMetadataAPIRequest(
          { query: READ_THREAD, variables: { id: threadId } },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
      const changeShare = (enabled: boolean) =>
        makeMetadataAPIRequest({
          query: SET_SHARE,
          variables: { threadId, target, enabled },
        });
      try {
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: true,
          expectToFail: false,
        });
        expect((await read()).body.errors[0].extensions.code).toBe('NOT_FOUND');
        expect((await changeShare(true)).body.errors).toBeUndefined();
        const readable = await read();
        expect(readable.body.errors).toBeUndefined();
        expect(readable.body.data.chatThread).toMatchObject({
          id: threadId,
          canManage: false,
        });
        const audienceDetails = await makeMetadataAPIRequest(
          {
            query: parse(`query SharingDetails($threadId: UUID!) {
            chatThreadSharing(threadId: $threadId) { canManage shares { principalId } roles { id } }
          }`),
            variables: { threadId },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(audienceDetails.body.data.chatThreadSharing).toEqual({
          canManage: false,
          shares: [],
          roles: [],
        });
        const rename = await makeMetadataAPIRequest(
          {
            query: parse(
              `mutation RenameSharedThread($id: UUID!) { renameChatThread(id: $id, title: "Unauthorized rename") { id } }`,
            ),
            variables: { id: threadId },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(rename.body.errors[0].extensions.code).toBe('NOT_FOUND');
        const grantAsViewer = await makeMetadataAPIRequest(
          {
            query: SET_SHARE,
            variables: { threadId, target: { everyone: true }, enabled: true },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(grantAsViewer.body.errors[0].extensions.code).toBe('NOT_FOUND');
        const anonymous = await makeMetadataAPIRequest(
          { query: READ_THREAD, variables: { id: threadId } },
          null,
        );
        expect(anonymous.body.errors).toBeDefined();
        expect((await changeShare(false)).body.errors).toBeUndefined();
        expect((await read()).body.errors[0].extensions.code).toBe('NOT_FOUND');
      } finally {
        await chatService.hardDeleteThread({ ...owner, threadId });
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: previousEnabled,
          expectToFail: false,
        });
      }
    },
  );
});
