import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const ATTACH_RECORD = parse(
  'mutation AttachRecord($input: InboxThreadRecordInput!) { attachRecordToInboxThread(input: $input) }',
);

const DETACH_RECORD = parse(
  'mutation DetachRecord($input: InboxThreadRecordInput!) { detachRecordFromInboxThread(input: $input) }',
);

const SHARE_THREAD = parse(
  'mutation ShareThread($input: ShareInboxThreadInput!) { shareInboxThread(input: $input) }',
);

const SEND_INBOX_MESSAGE = parse(
  'mutation SendInboxMessage($input: SendInboxMessageInput!) { sendInboxMessage(input: $input) { threadId } }',
);

const CHAT_THREAD = parse(
  'query ChatThread($id: UUID!) { chatThread(id: $id) { id } }',
);

type RecordShareGrant = {
  workspaceMemberId?: string;
  roleId?: string;
  everyone?: boolean;
  accessLevel: RecordShareAccessLevel;
};

type GraphqlResponse = {
  body: {
    data?: Record<string, unknown> | null;
    errors?: { extensions?: { code?: string; subCode?: string } }[];
  };
};

const expectGraphqlError = (
  response: GraphqlResponse,
  { code, subCode }: { code: string; subCode?: string },
) => {
  expect(response.body.errors?.[0]?.extensions).toMatchObject(
    isDefined(subCode) ? { code, subCode } : { code },
  );
};

describe('Inbox thread mutations for members and applications', () => {
  const companyId = randomUUID();
  const threadIds: string[] = [];
  let application: ApplicationWithResources;
  let applicationToken: string;
  let applicationRoleId: string;
  let memberRoleId: string;
  let guestRoleId: string;

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
  }): Promise<GraphqlResponse> =>
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

  const shareThread = ({
    threadId,
    grants,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    threadId: string;
    grants: RecordShareGrant[];
    token?: string;
  }): Promise<GraphqlResponse> =>
    makeMetadataApiRequest(
      { query: SHARE_THREAD, variables: { input: { threadId, grants } } },
      token,
    );

  const readThread = ({
    threadId,
    token,
  }: {
    threadId: string;
    token: string;
  }): Promise<GraphqlResponse> =>
    makeMetadataApiRequest(
      { query: CHAT_THREAD, variables: { id: threadId } },
      token,
    );

  const readCompanyLinks = (
    threadId: string,
  ): Promise<{ deletedAt: Date | null }[]> =>
    global.testDataSource.query(
      `SELECT "deletedAt" FROM ${SCHEMA}."agentChatThreadTarget"
       WHERE "threadId" = $1 AND "targetCompanyId" = $2
       ORDER BY "createdAt" ASC`,
      [threadId, companyId],
    );

  const readManualShares = (
    threadId: string,
  ): Promise<
    {
      principalType: RecordSharePrincipalType;
      principalId: string;
      accessLevel: RecordShareAccessLevel;
    }[]
  > =>
    global.testDataSource.query(
      `SELECT "principalType", "principalId", "accessLevel" FROM ${SCHEMA}."recordShare"
       WHERE "recordId" = $1 AND "rowCause" = 'MANUAL'
       ORDER BY "principalType" ASC, "principalId" ASC`,
      [threadId],
    );

  const readParticipantMemberIds = async (
    threadId: string,
  ): Promise<string[]> =>
    (
      await global.testDataSource.query(
        `SELECT "workspaceMemberId" FROM ${SCHEMA}."agentChatThreadParticipant"
         WHERE "threadId" = $1`,
        [threadId],
      )
    ).map(
      ({ workspaceMemberId }: { workspaceMemberId: string }) =>
        workspaceMemberId,
    );

  const readThreadUpdatedAt = async (threadId: string): Promise<Date> =>
    (
      await global.testDataSource.query(
        `SELECT "updatedAt" FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
        [threadId],
      )
    )[0].updatedAt;

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
    ({ id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' }));
    ({ id: guestRoleId } = await findOneRoleByLabel({ label: 'Guest' }));
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

  describe('attaching records', () => {
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

      expectGraphqlError(
        await attachRecord({ threadId, recordId: unreadableRecordId }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.RECORD_NOT_FOUND },
      );
      expectGraphqlError(
        await detachRecord({ threadId, recordId: unreadableRecordId }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.RECORD_NOT_FOUND },
      );
    });

    it('refuses a member who cannot edit the conversation', async () => {
      const threadId = await createMemberThread();

      expectGraphqlError(
        await attachRecord({ threadId, token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.THREAD_NOT_FOUND },
      );
      expect(await readCompanyLinks(threadId)).toEqual([]);
    });

    it('acts as the member when an application token carries one', async () => {
      const threadId = await createMemberThread();
      const memberApplicationToken = (
        await generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: application.id,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
          userId: USER_DATA_SEED_IDS.JANE,
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

      expectGraphqlError(
        await attachRecord({ threadId, token: applicationToken }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.THREAD_NOT_FOUND },
      );
      expect(await readCompanyLinks(threadId)).toEqual([]);
    });

    it('does not count a message a member sent through the application as the application taking part', async () => {
      const threadId = await createMemberThread();

      await recordMemberMessageSentThroughApplication(threadId);

      expectGraphqlError(
        await attachRecord({ threadId, token: applicationToken }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.THREAD_NOT_FOUND },
      );
      expectGraphqlError(
        await shareThread({
          threadId,
          token: applicationToken,
          grants: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.THREAD_NOT_FOUND },
      );
      expect(await readManualShares(threadId)).toEqual([]);
    });

    it('refuses an application whose role can only read the conversation', async () => {
      const threadId = await createMemberThread();

      await shareThread({
        threadId,
        grants: [
          {
            roleId: applicationRoleId,
            accessLevel: RecordShareAccessLevel.READ,
          },
        ],
      });

      expectGraphqlError(
        await attachRecord({ threadId, token: applicationToken }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.THREAD_NOT_FOUND },
      );
      expect(await readCompanyLinks(threadId)).toEqual([]);
    });

    it('lets an application whose role was granted the conversation attach records, but not share it', async () => {
      const threadId = await createMemberThread();

      expect(
        (
          await shareThread({
            threadId,
            grants: [
              {
                roleId: applicationRoleId,
                accessLevel: RecordShareAccessLevel.READ_WRITE,
              },
            ],
          })
        ).body,
      ).toEqual({ data: { shareInboxThread: true } });
      expect(
        (await attachRecord({ threadId, token: applicationToken })).body,
      ).toEqual({ data: { attachRecordToInboxThread: true } });
      expectGraphqlError(
        await shareThread({
          threadId,
          token: applicationToken,
          grants: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
        { code: 'NOT_FOUND', subCode: AiExceptionCode.THREAD_NOT_FOUND },
      );
      expect(await readManualShares(threadId)).toEqual([
        {
          principalType: RecordSharePrincipalType.ROLE,
          principalId: applicationRoleId,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        },
      ]);
    });
  });

  describe('sharing conversations', () => {
    it('lets a member read a conversation shared with them, without adding it to their inbox', async () => {
      const threadId = await createMemberThread();
      const updatedAtBeforeShare = await readThreadUpdatedAt(threadId);

      expectGraphqlError(
        await readThread({ threadId, token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
        { code: 'NOT_FOUND' },
      );

      expect(
        (
          await shareThread({
            threadId,
            grants: [
              {
                workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
                accessLevel: RecordShareAccessLevel.READ,
              },
            ],
          })
        ).body,
      ).toEqual({ data: { shareInboxThread: true } });

      expect(
        (await readThread({ threadId, token: APPLE_JONY_MEMBER_ACCESS_TOKEN }))
          .body,
      ).toEqual({ data: { chatThread: { id: threadId } } });
      expect(await readParticipantMemberIds(threadId)).toEqual([
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      ]);
      expect((await readThreadUpdatedAt(threadId)).getTime()).toBeGreaterThan(
        updatedAtBeforeShare.getTime(),
      );
    });

    it('shares with a member, a role and everyone in one call', async () => {
      const threadId = await createMemberThread();

      expect(
        (
          await shareThread({
            threadId,
            grants: [
              {
                workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
                accessLevel: RecordShareAccessLevel.READ_WRITE,
              },
              {
                roleId: memberRoleId,
                accessLevel: RecordShareAccessLevel.READ,
              },
              { everyone: true, accessLevel: RecordShareAccessLevel.READ },
            ],
          })
        ).body,
      ).toEqual({ data: { shareInboxThread: true } });
      expect(await readManualShares(threadId)).toEqual(
        expect.arrayContaining([
          {
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            accessLevel: RecordShareAccessLevel.READ_WRITE,
          },
          {
            principalType: RecordSharePrincipalType.ROLE,
            principalId: memberRoleId,
            accessLevel: RecordShareAccessLevel.READ,
          },
          {
            principalType: RecordSharePrincipalType.EVERYONE,
            principalId: expect.any(String),
            accessLevel: RecordShareAccessLevel.READ,
          },
        ]),
      );
      expect(await readManualShares(threadId)).toHaveLength(3);
    });

    it('takes a member grant away with NONE', async () => {
      const threadId = await createMemberThread();

      await shareThread({
        threadId,
        grants: [
          {
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            accessLevel: RecordShareAccessLevel.READ,
          },
        ],
      });

      expect(
        (
          await shareThread({
            threadId,
            grants: [
              {
                workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
                accessLevel: RecordShareAccessLevel.NONE,
              },
            ],
          })
        ).body,
      ).toEqual({ data: { shareInboxThread: true } });
      expect(await readManualShares(threadId)).toEqual([]);
      expectGraphqlError(
        await readThread({ threadId, token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
        { code: 'NOT_FOUND' },
      );
    });

    it('writes no grant when one principal cannot hold the conversation', async () => {
      const threadId = await createMemberThread();

      expectGraphqlError(
        await shareThread({
          threadId,
          grants: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              accessLevel: RecordShareAccessLevel.READ,
            },
            { roleId: guestRoleId, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
        { code: 'BAD_USER_INPUT', subCode: 'INVALID_SHARE_WITH' },
      );
      expect(await readManualShares(threadId)).toEqual([]);
    });

    it('writes no grant when one principal is not in the workspace', async () => {
      const threadId = await createMemberThread();

      expectGraphqlError(
        await shareThread({
          threadId,
          grants: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              accessLevel: RecordShareAccessLevel.READ,
            },
            { roleId: randomUUID(), accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
        { code: 'BAD_USER_INPUT', subCode: 'INVALID_SHARE_WITH' },
      );
      expect(await readManualShares(threadId)).toEqual([]);
    });

    it('refuses to share with a member who cannot use chats', async () => {
      const threadId = await createMemberThread();

      expectGraphqlError(
        await shareThread({
          threadId,
          grants: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
        {
          code: 'BAD_USER_INPUT',
          subCode: AiExceptionCode.CHAT_THREAD_GRANTEE_CANNOT_USE_CHATS,
        },
      );
      expect(await readManualShares(threadId)).toEqual([]);
    });

    it('refuses a participant who can edit the conversation but not manage its sharing', async () => {
      const threadId = await createMemberThread();

      await shareThread({
        threadId,
        grants: [
          {
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            accessLevel: RecordShareAccessLevel.READ_WRITE,
          },
        ],
      });

      expectGraphqlError(
        await shareThread({
          threadId,
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
          grants: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
        { code: 'NOT_FOUND' },
      );
      expect(await readManualShares(threadId)).toEqual([
        {
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        },
      ]);
    });

    it('shares as the application that started the conversation, without adding it to the inbox of the member', async () => {
      const threadId = await createApplicationThread();

      expect(
        (
          await shareThread({
            threadId,
            token: applicationToken,
            grants: [
              {
                workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
                accessLevel: RecordShareAccessLevel.READ,
              },
            ],
          })
        ).body,
      ).toEqual({ data: { shareInboxThread: true } });
      expect(
        (await readThread({ threadId, token: APPLE_JONY_MEMBER_ACCESS_TOKEN }))
          .body,
      ).toEqual({ data: { chatThread: { id: threadId } } });
      expect(await readParticipantMemberIds(threadId)).toEqual([
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      ]);
    });
  });
});
