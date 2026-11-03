import { parse } from 'graphql';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { readChatThreadFieldOperationFactory } from 'test/integration/graphql/utils/read-chat-thread-field-operation-factory.util';
import { readSharedChatThreadOperationFactory } from 'test/integration/graphql/utils/read-shared-chat-thread-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { type RowAccessRecord } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const LIST_THREADS = parse(`
  query DirectMessageThreads($threadId: UUID!) {
    agentChatThreads(filter: { id: { eq: $threadId } }) {
      totalCount
      edges { node { id title } }
    }
  }
`);

const LIST_PARTICIPANTS = parse(`
  query DirectMessageParticipants($threadId: UUID!) {
    agentChatThreadParticipants(filter: { threadId: { eq: $threadId } }) {
      totalCount
      edges { node { id thread { id title } } }
    }
  }
`);

const SET_THREAD_SHARE = parse(`
  mutation ShareDirectMessage($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!) {
    setRecordShare(target: $target, principal: $principal, accessLevel: READ_WRITE) {
      canManageSharing
    }
  }
`);

const MAKE_THREAD_PUBLIC = parse(`
  mutation MakeDirectMessagePublic($target: RecordTargetInput!) {
    setRecordPrivate(target: $target, isPrivate: false) { isPrivate }
  }
`);

describe('Direct message pair privacy', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let identityService: AgentChatDirectMessageIdentityService;
  let recordAccessPolicyService: RecordAccessPolicyService;
  let threadObjectMetadata: FlatObjectMetadata;
  let participantObjectMetadata: FlatObjectMetadata;
  let roleIdsByUserWorkspaceId: Record<string, string>;
  let wasRecordSharingEnabled: boolean;
  const participantIds = new Set<string>();

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    identityService =
      getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
        'AgentChatDirectMessageIdentityService',
      );
    recordAccessPolicyService =
      getAppProviderByClassName<RecordAccessPolicyService>(
        'RecordAccessPolicyService',
      );
    wasRecordSharingEnabled = await context.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      context.workspaceId,
    );
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
    });
    const { flatObjectMetadataMaps, userWorkspaceRoleMap } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(context.workspaceId, [
        'flatObjectMetadataMaps',
        'userWorkspaceRoleMap',
      ]);
    const threadMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const participantMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
      ];

    assertIsDefinedOrThrow(threadMetadata);
    assertIsDefinedOrThrow(participantMetadata);
    threadObjectMetadata = threadMetadata;
    participantObjectMetadata = participantMetadata;
    roleIdsByUserWorkspaceId = userWorkspaceRoleMap;
  });

  afterEach(async () => {
    await context.cleanup();
    await global.testDataSource.query(
      `DELETE FROM "${context.schema}"."recordShare" WHERE "recordId" = ANY($1::uuid[])`,
      [[...participantIds]],
    );
    participantIds.clear();
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: wasRecordSharingEnabled,
    });
  });

  const createDirectMessage = async ({
    firstWorkspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    secondWorkspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
  }: {
    firstWorkspaceMemberId?: string;
    secondWorkspaceMemberId?: string;
  } = {}) =>
    context.registerThread(
      await identityService.getOrCreate({
        workspaceId: context.workspaceId,
        firstWorkspaceMemberId,
        secondWorkspaceMemberId,
      }),
    );

  const grantAccess = ({
    recordId,
    principalId,
    principalType = RecordSharePrincipalType.WORKSPACE_MEMBER,
    objectMetadata = threadObjectMetadata,
    accessLevel = RecordShareAccessLevel.FULL,
  }: {
    recordId: string;
    principalId: string;
    principalType?: RecordSharePrincipalType;
    objectMetadata?: FlatObjectMetadata;
    accessLevel?: RecordShareAccessLevel;
  }) =>
    setManualRecordShare({
      workspaceId: context.workspaceId,
      enabled: true,
      share: {
        objectMetadataId: objectMetadata.id,
        recordId,
        sourceId: recordId,
        principalType,
        principalId,
        accessLevel,
      },
    });

  const readThread = ({
    threadId,
    token,
  }: {
    threadId: string;
    token: string;
  }) =>
    makeMetadataApiRequest(
      readSharedChatThreadOperationFactory({ threadId }),
      token,
    );

  const createParticipant = async (threadId: string) => {
    await getAppProviderByClassName<AgentChatThreadParticipantService>(
      'AgentChatThreadParticipantService',
    ).deliverToInbox({
      workspaceId: context.workspaceId,
      threadId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
    const participant = await global.testDataSource
      .createQueryBuilder()
      .select('*')
      .from(`${context.schema}.agentChatThreadParticipant`, 'participant')
      .where('"threadId" = :threadId', { threadId })
      .getRawOne<RowAccessRecord>();

    assertIsDefinedOrThrow(participant);
    participantIds.add(participant.id);

    return participant;
  };

  it('requires an ordinary grant for either pair member and preserves read-only access', async () => {
    const threadId = await createDirectMessage({
      firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    for (const token of [
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    ]) {
      expect((await readThread({ threadId, token })).body.errors).toBeDefined();
    }

    await grantAccess({
      recordId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
    await grantAccess({
      recordId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ,
    });

    for (const token of [
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    ]) {
      const response = await readThread({ threadId, token });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.chatThread.id).toBe(threadId);
    }

    await expect(
      context.sharingService.getThreadWithAccess({
        workspaceId: context.workspaceId,
        threadId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        operationType: 'update',
      }),
    ).resolves.toMatchObject({ id: threadId });
    await expect(
      context.sharingService.getThreadWithAccess({
        workspaceId: context.workspaceId,
        threadId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        operationType: 'update',
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
  });

  it('rejects canonical identity fields through generic creation', async () => {
    for (const data of [
      { conversationType: 'DIRECT_MESSAGE' },
      {
        directMessageFirstWorkspaceMemberId:
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        directMessageSecondWorkspaceMemberId:
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    ]) {
      const id = context.registerThread();
      const response = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          data: { id, ...data },
          gqlFields: 'id',
        }),
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(response.body.errors).toEqual([
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'FORBIDDEN',
            subCode: 'PERMISSION_DENIED',
          }),
        }),
      ]);
      expect(await context.readThread(id)).toBeUndefined();
    }
  });

  it('hides the DM and its participant from an administrator with stray member and role grants', async () => {
    const threadId = await createDirectMessage();

    await grantAccess({
      recordId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
    await grantAccess({
      recordId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
    await grantAccess({
      recordId: threadId,
      principalId: roleIdsByUserWorkspaceId[USER_WORKSPACE_DATA_SEED_IDS.JANE],
      principalType: RecordSharePrincipalType.ROLE,
    });
    const participant = await createParticipant(threadId);

    await grantAccess({
      recordId: participant.id,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      objectMetadata: participantObjectMetadata,
    });

    for (const { query, field } of [
      { query: LIST_THREADS, field: 'agentChatThreads' },
      { query: LIST_PARTICIPANTS, field: 'agentChatThreadParticipants' },
    ]) {
      const readable = await makeGraphqlApiRequest(
        { query, variables: { threadId } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      const hidden = await makeGraphqlApiRequest(
        { query, variables: { threadId } },
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(readable.body.errors).toBeUndefined();
      expect(hidden.body.errors).toBeUndefined();
      expect(readable.body.data[field].totalCount).toBe(1);
      expect(readable.body.data[field].edges).toHaveLength(1);
      expect(hidden.body.data[field]).toEqual({ totalCount: 0, edges: [] });
    }

    for (const field of [
      'chatThread',
      'chatMessages',
      'chatStreamCatchupChunks',
    ] as const) {
      const response = await makeMetadataApiRequest(
        readChatThreadFieldOperationFactory({ threadId, field }),
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    }

    const updated = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'agentChatThread',
        recordId: threadId,
        data: { title: 'Outsider title' },
        gqlFields: 'id title',
      }),
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );
    const restResponse = await makeRestApiRequest({
      method: 'get',
      path: `/agentChatThreads?filter=id[in]:["${threadId}"]`,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(updated.body.errors).toBeDefined();
    expect(restResponse.status).toBe(200);
    expect(restResponse.body.data.agentChatThreads).toEqual([]);
  });

  it('rejects sharing a DM outside its pair or making it public', async () => {
    const threadId = await createDirectMessage({
      firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    await grantAccess({
      recordId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
    const target = {
      objectMetadataId: threadObjectMetadata.id,
      recordId: threadId,
    };
    const pairShare = await makeMetadataApiRequest(
      {
        query: SET_THREAD_SHARE,
        variables: {
          target,
          principal: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
        },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(pairShare.body.errors).toBeUndefined();

    for (const principal of [
      { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM },
      { roleId: roleIdsByUserWorkspaceId[USER_WORKSPACE_DATA_SEED_IDS.JANE] },
    ]) {
      const response = await makeMetadataApiRequest(
        { query: SET_THREAD_SHARE, variables: { target, principal } },
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    }

    const publicResponse = await makeMetadataApiRequest(
      { query: MAKE_THREAD_PUBLIC, variables: { target } },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(publicResponse.body.errors[0].extensions.code).toBe(
      'BAD_USER_INPUT',
    );
  });

  it('filters thread and participant record events through the same pair boundary', async () => {
    const threadId = await createDirectMessage();

    for (const principalId of [
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    ]) {
      await grantAccess({ recordId: threadId, principalId });
    }

    const participant = await createParticipant(threadId);

    await grantAccess({
      recordId: participant.id,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      objectMetadata: participantObjectMetadata,
    });
    const thread = await global.testDataSource
      .createQueryBuilder()
      .select('*')
      .from(`${context.schema}.agentChatThread`, 'thread')
      .where('id = :threadId', { threadId })
      .getRawOne<RowAccessRecord>();

    assertIsDefinedOrThrow(thread);

    for (const { objectMetadata, record } of [
      { objectMetadata: threadObjectMetadata, record: thread },
      { objectMetadata: participantObjectMetadata, record: participant },
    ]) {
      const gate = recordAccessPolicyService.buildEventRecordAccessGate({
        workspaceId: context.workspaceId,
        name: `${objectMetadata.nameSingular}.created`,
        objectMetadata,
        events: [{ recordId: record.id, properties: { after: record } }],
      });
      const allowed = await gate.resolveAdmittedRecordIds({
        workspaceId: context.workspaceId,
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        },
        applicationPrincipal: { type: 'customApplication' },
      });
      const denied = await gate.resolveAdmittedRecordIds({
        workspaceId: context.workspaceId,
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
        applicationPrincipal: { type: 'customApplication' },
      });

      expect(allowed).toEqual(new Set([record.id]));
      expect(denied).toEqual(new Set());
    }
  });

  it('keeps an existing DM inaccessible while its identity feature flag is disabled', async () => {
    const threadId = await createDirectMessage();
    const featureFlag =
      FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED;

    await grantAccess({
      recordId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    try {
      await context.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: context.workspaceId,
        featureFlag,
        value: false,
      });
      const read = await readThread({
        threadId,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const listed = await makeGraphqlApiRequest(
        { query: LIST_THREADS, variables: { threadId } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(read.body.errors).toBeDefined();
      expect(listed.body.errors).toBeUndefined();
      expect(listed.body.data.agentChatThreads).toEqual({
        totalCount: 0,
        edges: [],
      });
    } finally {
      await context.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: context.workspaceId,
        featureFlag,
        value: true,
      });
    }
  });
});
