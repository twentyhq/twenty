import { type GraphQLFormattedError } from 'graphql';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OPEN_DIRECT_MESSAGE = gql`
  mutation OpenDirectMessage($workspaceMemberId: UUID!) {
    openDirectMessage(workspaceMemberId: $workspaceMemberId)
  }
`;

const READ_DIRECT_MESSAGE = gql`
  query ReadDirectMessage($threadId: UUID!) {
    chatMessages(threadId: $threadId) {
      parts {
        textContent
      }
    }
  }
`;

describe('Private text direct messages', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
  });

  const readContentRecords = (
    threadId: string,
  ): Promise<{ id: string; isPrivate: boolean }[]> =>
    global.testDataSource.query(
      `SELECT id, "_isPrivate" AS "isPrivate" FROM "${context.schema}"."agentChatThread" WHERE id = $1
       UNION ALL SELECT id, "_isPrivate" FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1
       UNION ALL SELECT id, "_isPrivate" FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1
       UNION ALL SELECT part.id, part."_isPrivate" FROM "${context.schema}"."agentMessagePart" part
         JOIN "${context.schema}"."agentMessage" message ON message.id = part."messageId" WHERE message."threadId" = $1`,
      [threadId],
    );

  afterEach(async () => {
    await context.cleanup();
  });

  const openDirectMessage = async ({
    workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    workspaceMemberId?: string;
    token?: string;
  } = {}) => {
    const response: {
      body: {
        data: { openDirectMessage: string };
        errors?: readonly GraphQLFormattedError[];
      };
    } = await makeMetadataApiRequest(
      { query: OPEN_DIRECT_MESSAGE, variables: { workspaceMemberId } },
      token,
    );

    expect(response.body.errors).toBeUndefined();

    const threadId = response.body.data.openDirectMessage;

    context.registerThread(threadId);

    return threadId;
  };

  it('reuses one private pair and restores it when the other member replies without running Ada', async () => {
    const threadId = await openDirectMessage();

    expect(
      await openDirectMessage({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      }),
    ).toBe(threadId);

    const sent = await sendChatParticipationMessage({
      threadId,
      text: 'Hello Jony',
      recipientWorkspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY.toUpperCase(),
      ],
    });

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "deletedAt" = CURRENT_TIMESTAMP WHERE id = $1`,
      [threadId],
    );

    const reply = await sendChatParticipationMessage({
      threadId,
      text: 'Hello Jane',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    for (const response of [sent, reply]) {
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.sendChatMessage).toMatchObject({
        queued: false,
        streamId: null,
      });
    }

    const history = await makeMetadataApiRequest(
      { query: READ_DIRECT_MESSAGE, variables: { threadId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(history.body.errors).toBeUndefined();
    expect(history.body.data.chatMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parts: [expect.objectContaining({ textContent: 'Hello Jony' })],
        }),
        expect.objectContaining({
          parts: [expect.objectContaining({ textContent: 'Hello Jane' })],
        }),
      ]),
    );
    expect(await context.readThread(threadId)).toMatchObject({
      deletedAt: null,
      isAssistantParticipant: false,
      activeStreamId: null,
    });

    const contentRecords = await readContentRecords(threadId);

    expect(contentRecords).toHaveLength(7);

    for (const { id, isPrivate } of contentRecords) {
      expect(isPrivate).toBe(true);

      const shares: { principalId: string }[] =
        await global.testDataSource.query(
          `SELECT "principalId" FROM "${context.schema}"."recordShare" WHERE "recordId" = $1 ORDER BY "principalId"`,
          [id],
        );

      expect(shares.map(({ principalId }) => principalId)).toEqual(
        [
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        ].sort(),
      );
    }
  });

  it('denies an outside administrator access to another pair', async () => {
    const threadId = await openDirectMessage({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const sent = await sendChatParticipationMessage({
      threadId,
      text: 'Private pair message',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(sent.body.errors).toBeUndefined();

    const response = await makeMetadataApiRequest({
      query: READ_DIRECT_MESSAGE,
      variables: { threadId },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.NOT_FOUND,
    );
    expect(response.body.data?.chatMessages).toBeFalsy();
  });

  it.each([
    { isAssistantMentioned: true },
    { attachments: [{ id: randomUUID(), filename: 'private.txt' }] },
  ])(
    'rejects unsupported Ada and file payloads before creating a message',
    async (payload) => {
      const threadId = await openDirectMessage();
      const response = await sendChatParticipationMessage({
        threadId,
        ...payload,
      });

      expect(response.body.errors?.[0]?.extensions).toMatchObject({
        code: ErrorCode.BAD_USER_INPUT,
        subCode: AiExceptionCode.INVALID_AGENT_INPUT,
      });
      expect(await readContentRecords(threadId)).toHaveLength(1);
    },
  );
});
