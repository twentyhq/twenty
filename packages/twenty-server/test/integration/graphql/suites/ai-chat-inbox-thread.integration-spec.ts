import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';

import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const ATTACH_RECORD = parse(
  'mutation AttachRecord($input: InboxThreadRecordInput!) { attachRecordToInboxThread(input: $input) }',
);

const DETACH_RECORD = parse(
  'mutation DetachRecord($input: InboxThreadRecordInput!) { detachRecordFromInboxThread(input: $input) }',
);

const SEND_INBOX_MESSAGE = parse(
  'mutation SendInboxMessage($input: SendInboxMessageInput!) { sendInboxMessage(input: $input) { threadId } }',
);

const expectNotFound = (
  response: GraphQLResponse<Record<string, unknown>>,
  subCode: AiExceptionCode,
) => {
  expect(response.body.errors?.[0]?.extensions).toMatchObject({
    code: 'NOT_FOUND',
    subCode,
  });
};

describe('Inbox thread mutations for members and applications', () => {
  const companyId = randomUUID();
  const threadIds: string[] = [];
  let application: ApplicationWithResources;
  let applicationToken: string;
  let applicationRoleId: string;

  type LinkRecordArgs = {
    threadId: string;
    recordId?: string;
    token?: string;
  };

  const linkRecord = ({
    mutation,
    threadId,
    recordId = companyId,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: LinkRecordArgs & {
    mutation: typeof ATTACH_RECORD;
  }) =>
    makeMetadataApiRequest(
      {
        query: mutation,
        variables: {
          input: { threadId, objectNameSingular: 'company', recordId },
        },
      },
      token,
    );

  const attachRecord = (args: LinkRecordArgs) =>
    linkRecord({ ...args, mutation: ATTACH_RECORD });

  const detachRecord = (args: LinkRecordArgs) =>
    linkRecord({ ...args, mutation: DETACH_RECORD });

  const readCompanyLinks = (
    threadId: string,
  ): Promise<{ deletedAt: Date | null }[]> =>
    global.testDataSource.query(
      `SELECT "deletedAt" FROM ${SCHEMA}."agentChatThreadTarget"
       WHERE "threadId" = $1 AND "targetCompanyId" = $2
       ORDER BY "createdAt" ASC`,
      [threadId, companyId],
    );

  const grantApplicationRoleAccess = async ({
    threadId,
    accessLevel,
  }: {
    threadId: string;
    accessLevel: RecordShareAccessLevel;
  }): Promise<void> => {
    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);

    await setManualRecordShare({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      enabled: true,
      share: {
        objectMetadataId:
          flatObjectMetadataMaps.byUniversalIdentifier[
            STANDARD_OBJECTS.agentChatThread.universalIdentifier
          ]!.id,
        recordId: threadId,
        principalId: applicationRoleId,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel,
        sourceId: threadId,
      },
    });
  };

  const createMemberThread = async (): Promise<string> => {
    const threadId = randomUUID();

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).createThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: threadId,
      title: 'Renewal prep',
    });
    threadIds.push(threadId);

    return threadId;
  };

  const createApplicationThread = async (): Promise<string> => {
    const response = await makeMetadataApiRequest(
      {
        query: SEND_INBOX_MESSAGE,
        variables: {
          input: {
            workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
            threadKey: `inbox-thread-${randomUUID()}`,
            idempotencyKey: 'call-recorded',
            title: 'Your call recording is ready',
            text: 'Your call with Acme was recorded.',
          },
        },
      },
      applicationToken,
    );

    if (isDefined(response.body.errors)) {
      throw new Error(
        `Could not send the inbox message: ${JSON.stringify(response.body.errors)}`,
      );
    }

    const { threadId } = response.body.data.sendInboxMessage;

    threadIds.push(threadId);

    return threadId;
  };

  const recordMemberMessageSentThroughApplication = async (
    threadId: string,
  ): Promise<void> => {
    const conversationWriter =
      getAppProviderByClassName<AgentConversationWriterService>(
        'AgentConversationWriterService',
      );
    const turnId = randomUUID();

    await conversationWriter.insertTurn({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      id: turnId,
      threadId,
      agentId: null,
      status: AgentTurnStatus.COMPLETED,
    });
    await conversationWriter.insertMessage({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      turnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      senderApplicationId: application.id,
      parts: [{ type: 'text', text: 'Summarize the renewal call' }],
    });
  };

  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { id: companyId, name: 'Inbox thread account' },
      }),
    );

    application = await setupApplicationWithResources({
      name: 'Inbox Thread Application',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
      canReadAndUpdateAllObjectRecords: true,
    });
    jest.useRealTimers();

    applicationToken = (
      await generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      })
    ).applicationAccessToken.token;

    [{ defaultRoleId: applicationRoleId }] = await global.testDataSource.query(
      `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
      [application.id],
    );
  });

  afterAll(async () => {
    for (const threadId of threadIds) {
      await destroyAgentChatThread({ threadId });
    }

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyId,
      }),
    );

    if (isDefined(application)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  });

  it('links the conversation to the record once, however often a member asks', async () => {
    const threadId = await createMemberThread();

    expect((await attachRecord({ threadId })).body).toEqual({
      data: { attachRecordToInboxThread: true },
    });
    expect((await attachRecord({ threadId })).body).toEqual({
      data: { attachRecordToInboxThread: true },
    });
    expect(await readCompanyLinks(threadId)).toEqual([{ deletedAt: null }]);
  });

  it('soft deletes the link on detach, changes nothing when detached again, and links again on attach', async () => {
    const threadId = await createMemberThread();

    await attachRecord({ threadId });

    expect((await detachRecord({ threadId })).body).toEqual({
      data: { detachRecordFromInboxThread: true },
    });
    expect((await detachRecord({ threadId })).body).toEqual({
      data: { detachRecordFromInboxThread: true },
    });
    expect(await readCompanyLinks(threadId)).toEqual([
      { deletedAt: expect.anything() },
    ]);

    await attachRecord({ threadId });

    expect(await readCompanyLinks(threadId)).toEqual([
      { deletedAt: expect.anything() },
      { deletedAt: null },
    ]);
  });

  it('reports a record the caller cannot read as not found, on attach and on detach', async () => {
    const threadId = await createMemberThread();
    const unreadableRecordId = randomUUID();

    expectNotFound(
      await attachRecord({ threadId, recordId: unreadableRecordId }),
      AiExceptionCode.RECORD_NOT_FOUND,
    );
    expectNotFound(
      await detachRecord({ threadId, recordId: unreadableRecordId }),
      AiExceptionCode.RECORD_NOT_FOUND,
    );
  });

  it('refuses a member who cannot edit the conversation', async () => {
    const threadId = await createMemberThread();

    expectNotFound(
      await attachRecord({ threadId, token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
      AiExceptionCode.THREAD_NOT_FOUND,
    );
    expect(await readCompanyLinks(threadId)).toEqual([]);
  });

  it('acts as the member when an application token carries one', async () => {
    const threadId = await createMemberThread();
    const memberApplicationToken = (
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      })
    ).applicationAccessToken.token;

    expect(
      (await attachRecord({ threadId, token: memberApplicationToken })).body,
    ).toEqual({ data: { attachRecordToInboxThread: true } });
    expect(await readCompanyLinks(threadId)).toEqual([{ deletedAt: null }]);
  });

  it('attaches and detaches as the application that wrote in the conversation', async () => {
    const threadId = await createApplicationThread();

    expect(
      (await attachRecord({ threadId, token: applicationToken })).body,
    ).toEqual({ data: { attachRecordToInboxThread: true } });
    expect(await readCompanyLinks(threadId)).toEqual([{ deletedAt: null }]);

    expect(
      (await detachRecord({ threadId, token: applicationToken })).body,
    ).toEqual({ data: { detachRecordFromInboxThread: true } });
    expect(await readCompanyLinks(threadId)).toEqual([
      { deletedAt: expect.anything() },
    ]);
  });

  it('refuses an application that neither wrote in the conversation nor reaches it through its role', async () => {
    const threadId = await createMemberThread();

    expectNotFound(
      await attachRecord({ threadId, token: applicationToken }),
      AiExceptionCode.THREAD_NOT_FOUND,
    );
    expect(await readCompanyLinks(threadId)).toEqual([]);
  });

  it('does not count a message a member sent through the application as the application taking part', async () => {
    const threadId = await createMemberThread();

    await recordMemberMessageSentThroughApplication(threadId);

    expectNotFound(
      await attachRecord({ threadId, token: applicationToken }),
      AiExceptionCode.THREAD_NOT_FOUND,
    );
    expect(await readCompanyLinks(threadId)).toEqual([]);
  });

  it('refuses an application whose role can only read the conversation', async () => {
    const threadId = await createMemberThread();

    await grantApplicationRoleAccess({
      threadId,
      accessLevel: RecordShareAccessLevel.READ,
    });

    expectNotFound(
      await attachRecord({ threadId, token: applicationToken }),
      AiExceptionCode.THREAD_NOT_FOUND,
    );
    expect(await readCompanyLinks(threadId)).toEqual([]);
  });

  it('lets an application whose role was granted the conversation attach records', async () => {
    const threadId = await createMemberThread();

    await grantApplicationRoleAccess({
      threadId,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    expect(
      (await attachRecord({ threadId, token: applicationToken })).body,
    ).toEqual({ data: { attachRecordToInboxThread: true } });
    expect(await readCompanyLinks(threadId)).toEqual([{ deletedAt: null }]);
  });
});
