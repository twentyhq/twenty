import { parse } from 'graphql';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import {
  CREATE_CHANNEL,
  CREATE_THREAD,
  DELETE_CHANNEL,
  setRoleAllChannelsAccess,
} from 'test/integration/graphql/suites/chat-channel/utils/chat-channel-test.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { readSharedChatThreadOperationFactory } from 'test/integration/graphql/utils/read-shared-chat-thread-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { syncAgentChatAccessRules } from 'test/integration/permissions/agent-chat-access/utils/sync-agent-chat-access-rules.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RevokeRoleWideAccessToAgentChatObjectsCommand } from 'src/engine/permissions/agent-chat-access/commands/revoke-role-wide-access-to-agent-chat-objects.command';
import { AGENT_CHAT_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/agent-chat-access/constants/agent-chat-object-universal-identifiers.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const FLAGS = [
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_AGENT_CHAT_RLS_ENABLED,
];

const CHAT_MEMBERS = parse(`query Members($threadId: UUID!) {
  agentChatThreadMembers(threadId: $threadId) {
    canManageSharing
    shares { principalType principalId accessLevel rowCause }
  }
}`);

const ADD_MEMBER =
  parse(`mutation AddMember($threadId: UUID!, $memberWorkspaceMemberId: UUID!) {
  addAgentChatThreadMember(threadId: $threadId, memberWorkspaceMemberId: $memberWorkspaceMemberId) { canManageSharing }
}`);

const REMOVE_MEMBER =
  parse(`mutation RemoveMember($threadId: UUID!, $memberWorkspaceMemberId: UUID!) {
  removeAgentChatThreadMember(threadId: $threadId, memberWorkspaceMemberId: $memberWorkspaceMemberId) { canManageSharing }
}`);

const UPDATE_CHANNEL_ROLES = parse(
  `mutation UpdateChannel($channelId: UUID!, $input: UpdateAgentChatChannelInput!) { updateAgentChatChannel(channelId: $channelId, input: $input) { id } }`,
);

const revokeRoleWideAccessToAgentChatObjects = () =>
  getAppProviderByClassName<RevokeRoleWideAccessToAgentChatObjectsCommand>(
    'RevokeRoleWideAccessToAgentChatObjectsCommand',
  ).runOnWorkspace({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    options: {},
    index: 0,
    total: 1,
  });

const restoreRoleWideAccessToAgentChatObjects = async () => {
  await global.testDataSource.query(
    `DELETE FROM core."objectPermission" "objectPermission"
      USING core."objectMetadata" "objectMetadata", core."role" "role"
      WHERE "objectMetadata".id = "objectPermission"."objectMetadataId"
        AND "role".id = "objectPermission"."roleId"
        AND "role"."canBeAssignedToUsers"
        AND NOT "role"."isSystemSideEffect"
        AND "objectPermission"."workspaceId" = $1
        AND "objectMetadata"."universalIdentifier" = ANY($2)`,
    [SEED_APPLE_WORKSPACE_ID, AGENT_CHAT_OBJECT_UNIVERSAL_IDENTIFIERS],
  );
  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatObjectPermissionMaps',
    'rolesPermissions',
  ]);
};

const canReadThread = async (threadId: string, token: string) => {
  const response = await makeMetadataApiRequest(
    readSharedChatThreadOperationFactory({ threadId }),
    token,
  );

  return isDefined(response.body.data?.chatThread);
};

const canReadThreadRecord = async (threadId: string, token: string) => {
  const response = await makeGraphqlApiRequest(
    findOneOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      gqlFields: 'id',
      filter: { id: { eq: threadId } },
    }),
    token,
  );

  return isDefined(response.body.data?.agentChatThread);
};

describe('chat access through individual role rules (integration)', () => {
  const createdThreads: { threadId: string; token: string }[] = [];
  const createdChannelIds: string[] = [];
  let memberRoleId: string;

  const createThread = async ({
    token,
    channelId = null,
  }: {
    token: string;
    channelId?: string | null;
  }): Promise<string> => {
    const response = await makeMetadataApiRequest(
      { query: CREATE_THREAD, variables: { channelId } },
      token,
    );

    expect(response.body.errors).toBeUndefined();

    const threadId = response.body.data.createChatThread.id;

    createdThreads.push({ threadId, token });
    await waitForAllJobsToFinish();

    return threadId;
  };

  const createChannel = async (roleIds: string[]): Promise<string> => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: `Channel ${Date.now()}`, roleIds } },
    });

    expect(response.body.errors).toBeUndefined();

    const channelId = response.body.data.createAgentChatChannel.id;

    createdChannelIds.push(channelId);

    return channelId;
  };

  afterEach(async () => {
    for (const { threadId, token } of createdThreads.splice(0)) {
      await destroyAgentChatThread({ threadId, token });
    }
    for (const channelId of createdChannelIds.splice(0)) {
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId },
      });
    }
  });

  beforeAll(async () => {
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    for (const featureFlag of FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: true,
        expectToFail: false,
      });
    }
    await revokeRoleWideAccessToAgentChatObjects();
    await setRoleAllChannelsAccess(memberRoleId, false);
    await syncAgentChatAccessRules();
  });

  afterAll(async () => {
    await restoreRoleWideAccessToAgentChatObjects();
    await setRoleAllChannelsAccess(memberRoleId, true);

    for (const featureFlag of [...FLAGS].reverse()) {
      await updateFeatureFlag({
        featureFlag,
        value: false,
        expectToFail: false,
      });
    }
    await syncAgentChatAccessRules();
  });

  it('reaches a chat only as its participant', async () => {
    const threadId = await createThread({
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(await canReadThread(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      true,
    );
    expect(
      await canReadThreadRecord(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBe(true);
    expect(await canReadThread(threadId, APPLE_JANE_ADMIN_ACCESS_TOKEN)).toBe(
      false,
    );
    expect(
      await canReadThreadRecord(threadId, APPLE_JANE_ADMIN_ACCESS_TOKEN),
    ).toBe(false);
  });

  it('adds and removes chat members as participants', async () => {
    const threadId = await createThread({
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const variables = {
      threadId,
      memberWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    };

    const addMemberResponse = await makeMetadataApiRequest(
      { query: ADD_MEMBER, variables },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(addMemberResponse.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();

    expect(await canReadThread(threadId, APPLE_JANE_ADMIN_ACCESS_TOKEN)).toBe(
      true,
    );

    const membersResponse = await makeMetadataApiRequest(
      { query: CHAT_MEMBERS, variables: { threadId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(membersResponse.body.data.agentChatThreadMembers).toMatchObject({
      canManageSharing: true,
      shares: expect.arrayContaining([
        expect.objectContaining({
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          accessLevel: RecordShareAccessLevel.FULL,
        }),
        expect.objectContaining({
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        }),
      ]),
    });

    const removeMemberResponse = await makeMetadataApiRequest(
      { query: REMOVE_MEMBER, variables },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(removeMemberResponse.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();

    expect(await canReadThread(threadId, APPLE_JANE_ADMIN_ACCESS_TOKEN)).toBe(
      false,
    );
  });

  it('reaches channel chats through the roles of the channel', async () => {
    const channelId = await createChannel([memberRoleId]);

    await syncAgentChatAccessRules();

    const threadId = await createThread({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      channelId,
    });

    expect(await canReadThread(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      true,
    );

    const updateResponse = await makeMetadataApiRequest({
      query: UPDATE_CHANNEL_ROLES,
      variables: { channelId, input: { roleIds: [] } },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    await syncAgentChatAccessRules();

    expect(await canReadThread(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      false,
    );
  });
});
