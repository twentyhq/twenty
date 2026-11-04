import { Test } from '@nestjs/testing';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecord } from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { DirectMessageContentService } from 'src/engine/permissions/record-share/services/direct-message-content.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace' },
} as UserWorkspaceAuthContext;

describe('DirectMessageContentService', () => {
  let service: DirectMessageContentService;
  let records: Record<string, Record<string, ObjectRecord>>;
  const getRepository = jest.fn();
  const executeInWorkspaceContext = jest.fn((work: () => Promise<boolean>) =>
    work(),
  );

  beforeEach(async () => {
    jest.clearAllMocks();
    records = {
      agentChatThread: {
        thread: { id: 'thread', conversationType: 'DIRECT_MESSAGE' },
      },
      agentChatThreadParticipant: {
        participant: { id: 'participant', threadId: 'thread' },
      },
      agentChatThreadTarget: {
        target: { id: 'target', threadId: 'thread' },
      },
      agentTurn: { turn: { id: 'turn', threadId: 'thread' } },
      agentMessage: { message: { id: 'message', threadId: 'thread' } },
      agentMessagePart: { part: { id: 'part', messageId: 'message' } },
      agentMessageReaction: {
        reaction: { id: 'reaction', messageId: 'message' },
      },
    };
    getRepository.mockImplementation((objectName: string) => ({
      findOne: jest.fn(
        async ({ where }: { where: { id: string } }) =>
          records[objectName]?.[where.id] ?? null,
      ),
    }));

    const module = await Test.createTestingModule({
      providers: [
        DirectMessageContentService,
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext,
            getRepositoryWithoutPermissionChecks: getRepository,
          },
        },
      ],
    }).compile();

    service = module.get(DirectMessageContentService);
  });

  it.each([
    { objectName: 'agentChatThread', recordId: 'thread' },
    { objectName: 'agentChatThreadParticipant', recordId: 'participant' },
    { objectName: 'agentChatThreadTarget', recordId: 'target' },
    { objectName: 'agentTurn', recordId: 'turn' },
    { objectName: 'agentMessage', recordId: 'message' },
    { objectName: 'agentMessagePart', recordId: 'part' },
    { objectName: 'agentMessageReaction', recordId: 'reaction' },
  ] as const)(
    'keeps sharing managed for direct-message $objectName records',
    async ({ objectName, recordId }) => {
      expect(
        await service.isDirectMessageContent({
          authContext: AUTH_CONTEXT,
          objectUniversalIdentifier:
            STANDARD_OBJECTS[objectName].universalIdentifier,
          recordId,
        }),
      ).toBe(true);
    },
  );

  it.each([
    { objectName: 'agentMessage', recordId: 'message' },
    { objectName: 'agentMessagePart', recordId: 'part' },
    { objectName: 'agentMessageReaction', recordId: 'reaction' },
  ] as const)(
    'preserves sharing for ordinary conversation $objectName records',
    async ({ objectName, recordId }) => {
      records.agentChatThread.thread.conversationType = 'STANDARD';

      expect(
        await service.isDirectMessageContent({
          authContext: AUTH_CONTEXT,
          objectUniversalIdentifier:
            STANDARD_OBJECTS[objectName].universalIdentifier,
          recordId,
        }),
      ).toBe(false);
    },
  );

  it('keeps orphaned message content unshareable', async () => {
    expect(
      await service.isDirectMessageContent({
        authContext: AUTH_CONTEXT,
        objectUniversalIdentifier:
          STANDARD_OBJECTS.agentMessagePart.universalIdentifier,
        recordId: 'content',
      }),
    ).toBe(true);
  });

  it('preserves independent sharing for unrelated records without reading storage', async () => {
    expect(
      await service.isDirectMessageContent({
        authContext: AUTH_CONTEXT,
        objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
        recordId: 'content',
      }),
    ).toBe(false);
    expect(executeInWorkspaceContext).not.toHaveBeenCalled();
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('reads the full conversation ancestry from the supplied transaction', async () => {
    const findOne = jest.fn(async ({ where }: { where: { id: string } }) => {
      const recordsById: Record<string, ObjectRecord> = {
        part: records.agentMessagePart.part,
        message: records.agentMessage.message,
        thread: records.agentChatThread.thread,
      };

      return recordsById[where.id] ?? null;
    });
    const getTransactionRepository = jest.fn(() => ({ findOne }));
    const transactionScope = {
      getRepositoryWithoutPermissionChecks: getTransactionRepository,
    } as unknown as WorkspaceTransactionScope;

    expect(
      await service.isDirectMessageContent({
        authContext: AUTH_CONTEXT,
        objectUniversalIdentifier:
          STANDARD_OBJECTS.agentMessagePart.universalIdentifier,
        recordId: 'part',
        transactionScope,
      }),
    ).toBe(true);
    expect(getRepository).not.toHaveBeenCalled();
    expect(getTransactionRepository.mock.calls).toEqual([
      ['agentMessagePart'],
      ['agentMessage'],
      ['agentChatThread'],
    ]);
    expect(findOne.mock.calls).toEqual([
      [{ where: { id: 'part' }, select: ['messageId'], withDeleted: true }],
      [{ where: { id: 'message' }, select: ['threadId'], withDeleted: true }],
      [
        {
          where: { id: 'thread' },
          select: ['conversationType'],
          withDeleted: true,
        },
      ],
    ]);
    expect(executeInWorkspaceContext).toHaveBeenCalledWith(
      expect.any(Function),
      AUTH_CONTEXT,
    );
  });
});
