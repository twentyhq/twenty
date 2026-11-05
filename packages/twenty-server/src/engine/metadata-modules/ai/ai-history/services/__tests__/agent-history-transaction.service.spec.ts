import { isArray } from '@sniptt/guards';
import { In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryTransactionService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-transaction.service';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

const WORKSPACE_ID = '20202020-2020-4020-8020-202020202020';
const THREAD_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_THREAD_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TURN_ID = '22222222-2222-4222-8222-222222222222';
const MESSAGE_ID = '33333333-3333-4333-8333-333333333333';
const FIRST_PART_ID = '44444444-4444-4444-8444-444444444444';
const SECOND_PART_ID = '55555555-5555-4555-8555-555555555555';
const DIRECT_MESSAGE_PAIR = [
  '66666666-6666-4666-8666-666666666666',
  '77777777-7777-4777-8777-777777777777',
] as const;

const createRepository = () => ({
  insert: jest
    .fn()
    .mockImplementation(async (values: { id: string } | { id: string }[]) => ({
      identifiers: (isArray(values) ? values : [values]).map(({ id }) => ({
        id,
      })),
    })),
  upsert: jest.fn().mockImplementation(async ({ id }: { id: string }) => ({
    identifiers: [{ id }],
  })),
  update: jest.fn().mockResolvedValue({ generatedMaps: [] }),
  find: jest.fn().mockResolvedValue([]),
  delete: jest.fn().mockResolvedValue({ raw: [] }),
});

const buildService = ({
  pair = DIRECT_MESSAGE_PAIR,
}: {
  pair?: readonly [string, string] | null;
} = {}) => {
  const repositories = {
    agentChatThread: createRepository(),
    agentTurn: createRepository(),
    agentMessage: createRepository(),
    agentMessagePart: createRepository(),
  };
  const transactionScope = {
    workspaceId: WORKSPACE_ID,
    getRepositoryWithoutPermissionChecks: jest
      .fn()
      .mockImplementation((name: AgentHistoryObjectName) => repositories[name]),
    executeRawQuery: jest.fn().mockResolvedValue([]),
    afterCommit: jest.fn(),
  };
  const orm = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation(async (work: () => Promise<unknown>) => work()),
    runInWorkspaceTransaction: jest
      .fn()
      .mockImplementation(
        async (work: (scope: WorkspaceTransactionScope) => Promise<unknown>) =>
          work(transactionScope as never),
      ),
  };
  const privacy = {
    findDirectMessagePairOfThread: jest.fn().mockResolvedValue(pair),
    makeConversationRecordsPrivateToPair: jest
      .fn()
      .mockResolvedValue(undefined),
    deletePairSharesOfConversationRecords: jest
      .fn()
      .mockResolvedValue(undefined),
  };

  return {
    service: new AgentHistoryTransactionService(orm as never, privacy),
    repositories,
    privacy,
    transactionScope,
  };
};

describe('AgentHistoryTransactionService', () => {
  it('shares a new DM and its history in the writing transaction without parent-message reads', async () => {
    const { service, repositories, privacy, transactionScope } = buildService();

    repositories.agentMessagePart.insert.mockResolvedValue({
      identifiers: [{ id: FIRST_PART_ID }, { id: SECOND_PART_ID }],
    });
    privacy.findDirectMessagePairOfThread.mockImplementation(async () => {
      expect(repositories.agentChatThread.upsert).toHaveBeenCalledWith(
        { id: THREAD_ID },
        ['id'],
      );

      return DIRECT_MESSAGE_PAIR;
    });

    await service.run({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      work: async (scope) => {
        await scope.upsert({
          name: 'agentChatThread',
          values: { id: THREAD_ID },
          conflictPaths: ['id'],
        });
        await scope.insert({
          name: 'agentTurn',
          values: { id: TURN_ID, threadId: THREAD_ID },
        });
        await scope.insert({
          name: 'agentMessage',
          values: { id: MESSAGE_ID, threadId: THREAD_ID, turnId: TURN_ID },
        });
        await scope.insert({
          name: 'agentMessagePart',
          values: [
            { messageId: MESSAGE_ID, type: 'text', textContent: 'Hello' },
            { messageId: MESSAGE_ID, type: 'text', textContent: 'Again' },
          ],
        });
      },
    });

    expect(privacy.findDirectMessagePairOfThread).toHaveBeenCalledTimes(1);
    expect(privacy.findDirectMessagePairOfThread).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      transactionScope,
    });
    expect(privacy.makeConversationRecordsPrivateToPair.mock.calls).toEqual(
      [
        {
          conversationObjectName: 'agentChatThread',
          conversationRecordIds: [THREAD_ID],
        },
        {
          conversationObjectName: 'agentTurn',
          conversationRecordIds: [TURN_ID],
        },
        {
          conversationObjectName: 'agentMessage',
          conversationRecordIds: [MESSAGE_ID],
        },
        {
          conversationObjectName: 'agentMessagePart',
          conversationRecordIds: [FIRST_PART_ID, SECOND_PART_ID],
        },
      ].map((records) => [
        {
          workspaceId: WORKSPACE_ID,
          transactionScope,
          pair: DIRECT_MESSAGE_PAIR,
          ...records,
        },
      ]),
    );
    for (const [records] of privacy.makeConversationRecordsPrivateToPair.mock
      .calls) {
      expect(records.transactionScope).toBe(transactionScope);
    }
    expect(repositories.agentMessage.find).not.toHaveBeenCalled();
    expect(repositories.agentMessagePart.find).not.toHaveBeenCalled();
    expect(transactionScope.executeRawQuery).toHaveBeenCalledWith(
      expect.stringContaining('pg_advisory_xact_lock'),
      [
        expect.stringContaining(
          `agent-history-upsert:${WORKSPACE_ID}:agentChatThread:`,
        ),
      ],
    );
    expect(
      transactionScope.executeRawQuery.mock.invocationCallOrder[0],
    ).toBeLessThan(
      repositories.agentChatThread.upsert.mock.invocationCallOrder[0],
    );
  });

  it('shares messages and parts when caller UUID casing differs from stored identifiers', async () => {
    const { service, repositories, privacy, transactionScope } = buildService();
    const threadId = 'abcdefab-cdef-4abc-8def-abcdefabcdef';
    const messageId = 'fedcbafe-dcba-4fed-8cba-fedcbafedcba';
    const messagePart = {
      id: FIRST_PART_ID,
      messageId: messageId.toUpperCase(),
      type: 'text',
      textContent: 'Hello',
    };

    repositories.agentMessage.insert.mockResolvedValue({
      identifiers: [{ id: messageId }],
    });

    await expect(
      service.run({
        workspaceId: WORKSPACE_ID,
        threadId: threadId.toUpperCase(),
        work: async (scope) => {
          await scope.insert({
            name: 'agentMessage',
            values: { id: messageId.toUpperCase(), threadId },
          });
          await scope.insert({
            name: 'agentMessagePart',
            values: messagePart,
          });
        },
      }),
    ).resolves.toBeUndefined();

    expect(repositories.agentMessagePart.insert).toHaveBeenCalledWith(
      messagePart,
    );
    expect(
      privacy.makeConversationRecordsPrivateToPair,
    ).toHaveBeenNthCalledWith(1, {
      workspaceId: WORKSPACE_ID,
      transactionScope,
      pair: DIRECT_MESSAGE_PAIR,
      conversationObjectName: 'agentMessage',
      conversationRecordIds: [messageId],
    });
    expect(
      privacy.makeConversationRecordsPrivateToPair,
    ).toHaveBeenNthCalledWith(2, {
      workspaceId: WORKSPACE_ID,
      transactionScope,
      pair: DIRECT_MESSAGE_PAIR,
      conversationObjectName: 'agentMessagePart',
      conversationRecordIds: [FIRST_PART_ID],
    });
  });

  it('keeps ordinary conversation creation and unscoped turns free of pair grants', async () => {
    for (const threadId of [THREAD_ID, null]) {
      const { service, repositories, privacy } = buildService({ pair: null });

      privacy.findDirectMessagePairOfThread.mockImplementation(async () => {
        expect(repositories.agentChatThread.insert).toHaveBeenCalledWith({
          id: THREAD_ID,
        });

        return null;
      });

      await service.run({
        workspaceId: WORKSPACE_ID,
        threadId,
        work: async (scope) => {
          expect(scope.threadId).toBe(threadId);

          await scope.insert({
            name: isDefined(threadId) ? 'agentChatThread' : 'agentTurn',
            values: isDefined(threadId)
              ? { id: threadId }
              : { id: TURN_ID, threadId: null },
          });
        },
      });

      expect(privacy.findDirectMessagePairOfThread).toHaveBeenCalledTimes(
        isDefined(threadId) ? 1 : 0,
      );
      expect(
        privacy.makeConversationRecordsPrivateToPair,
      ).not.toHaveBeenCalled();
      expect(
        isDefined(threadId)
          ? repositories.agentChatThread.insert
          : repositories.agentTurn.insert,
      ).toHaveBeenCalledTimes(1);
    }
  });

  it('rejects an entire message batch containing another conversation before inserting', async () => {
    const { service, repositories, privacy } = buildService();

    await expect(
      service.run({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        work: (scope) =>
          scope.insert({
            name: 'agentMessage',
            values: [
              { id: MESSAGE_ID, threadId: THREAD_ID },
              { id: 'other-message', threadId: OTHER_THREAD_ID },
            ],
          }),
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });

    expect(repositories.agentMessage.insert).not.toHaveBeenCalled();
    expect(privacy.findDirectMessagePairOfThread).not.toHaveBeenCalled();
  });

  it('rejects parts whose parent message was not written in the conversation transaction', async () => {
    const { service, repositories } = buildService();

    await expect(
      service.run({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        work: (scope) =>
          scope.insert({
            name: 'agentMessagePart',
            values: { id: FIRST_PART_ID, messageId: MESSAGE_ID },
          }),
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });

    expect(repositories.agentMessagePart.insert).not.toHaveBeenCalled();
    expect(repositories.agentMessage.find).not.toHaveBeenCalled();
  });

  it('rejects the transaction callback when pair sharing fails', async () => {
    const { service, repositories, privacy } = buildService();
    const sharingFailure = new Error('Pair sharing failed');

    privacy.makeConversationRecordsPrivateToPair.mockRejectedValue(
      sharingFailure,
    );

    await expect(
      service.run({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        work: async (scope) => {
          await scope.insert({
            name: 'agentTurn',
            values: { id: TURN_ID, threadId: THREAD_ID },
          });
          await scope.insert({
            name: 'agentMessage',
            values: { id: MESSAGE_ID, threadId: THREAD_ID, turnId: TURN_ID },
          });
        },
      }),
    ).rejects.toBe(sharingFailure);

    expect(repositories.agentTurn.insert).toHaveBeenCalledTimes(1);
    expect(repositories.agentMessage.insert).not.toHaveBeenCalled();
  });

  it('removes a DM message and its part grants before deleting the parent', async () => {
    const { service, repositories, privacy, transactionScope } = buildService();

    repositories.agentMessage.find.mockResolvedValue([{ id: MESSAGE_ID }]);
    repositories.agentMessagePart.delete.mockResolvedValue({
      raw: [{ id: FIRST_PART_ID }, { id: SECOND_PART_ID }],
    });
    repositories.agentMessage.delete.mockResolvedValue({
      raw: [{ id: MESSAGE_ID }],
    });

    await expect(
      service.run({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        work: (scope) =>
          scope.delete({
            name: 'agentMessage',
            where: { id: MESSAGE_ID },
          }),
      }),
    ).resolves.toBe(1);

    expect(repositories.agentMessagePart.delete).toHaveBeenCalledWith({
      messageId: In([MESSAGE_ID]),
    });
    expect(
      privacy.deletePairSharesOfConversationRecords,
    ).toHaveBeenNthCalledWith(1, {
      workspaceId: WORKSPACE_ID,
      transactionScope,
      conversationObjectName: 'agentMessagePart',
      conversationRecordIds: [FIRST_PART_ID, SECOND_PART_ID],
    });
    expect(
      privacy.deletePairSharesOfConversationRecords,
    ).toHaveBeenNthCalledWith(2, {
      workspaceId: WORKSPACE_ID,
      transactionScope,
      conversationObjectName: 'agentMessage',
      conversationRecordIds: [MESSAGE_ID],
    });
    expect(
      privacy.deletePairSharesOfConversationRecords.mock.invocationCallOrder[0],
    ).toBeLessThan(
      repositories.agentMessage.delete.mock.invocationCallOrder[0],
    );
  });

  it('keeps a queued message and its parts when promotion wins the deletion lock', async () => {
    const { service, repositories, privacy, transactionScope } = buildService();

    repositories.agentMessage.find
      .mockResolvedValueOnce([{ id: MESSAGE_ID }])
      .mockResolvedValueOnce([]);

    await expect(
      service.run({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        work: (scope) =>
          scope.delete({
            name: 'agentMessage',
            where: { id: MESSAGE_ID, status: AgentMessageStatus.QUEUED },
          }),
      }),
    ).resolves.toBe(0);

    expect(transactionScope.executeRawQuery).toHaveBeenCalledWith(
      expect.stringContaining('FOR UPDATE'),
      [[MESSAGE_ID]],
    );
    expect(repositories.agentMessage.find).toHaveBeenLastCalledWith({
      where: { id: In([MESSAGE_ID]), status: AgentMessageStatus.QUEUED },
      select: ['id'],
      withDeleted: true,
    });
    expect(repositories.agentMessage.delete).not.toHaveBeenCalled();
    expect(repositories.agentMessagePart.delete).not.toHaveBeenCalled();
    expect(
      privacy.deletePairSharesOfConversationRecords,
    ).not.toHaveBeenCalled();
  });
});
