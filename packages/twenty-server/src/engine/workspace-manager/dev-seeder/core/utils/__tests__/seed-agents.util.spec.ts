import { type QueryRunner } from 'typeorm';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { seedAgents } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';

type SeedRow = {
  id: string;
  workspaceId: string;
  threadId?: string;
  turnId?: string;
  messageId?: string;
  role?: string;
  userWorkspaceId?: string;
  channelId?: string | null;
  authorUserWorkspaceId?: string | null;
  workflowRunId?: string | null;
  workflowStepId?: string | null;
  pendingQuestionMessageId?: string | null;
  toolName?: string | null;
  createdAt: Date;
};

describe('seedAgents', () => {
  it.each([
    [SEED_APPLE_WORKSPACE_ID, 5, 28, 14, 7, 2, 5, 1, 2],
    [SEED_YCOMBINATOR_WORKSPACE_ID, 1, 4, 2, 1, 0, 0, 0, 0],
  ])(
    'keeps messages, turns, and parts in their owning conversation for %s',
    async (
      workspaceId,
      threadCount,
      messageCount,
      turnCount,
      participantCount,
      channelCount,
      channelMemberCount,
      channelRoleCount,
      runThreadCount,
    ) => {
      const tables = new Map<string, SeedRow[]>();
      let tableName: string;
      const queryBuilder = {
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };
      queryBuilder.into.mockImplementation((name: string) => {
        tableName = name;

        return queryBuilder;
      });
      queryBuilder.values.mockImplementation((rows: SeedRow[]) => {
        tables.set(tableName, [...(tables.get(tableName) ?? []), ...rows]);

        return queryBuilder;
      });
      const queryRunner = {
        manager: { createQueryBuilder: () => queryBuilder },
      } as unknown as QueryRunner;

      await seedAgents({
        queryRunner,
        schemaName: 'core',
        workspaceId,
        chatReferenceIds: {
          applicationId: 'application-id',
          objectMetadataId: 'object-id',
          roleId: 'role-id',
          viewId: 'view-id',
        },
      });

      const threads = tables.get('core.agentChatThread') ?? [];
      const turns = tables.get('core.agentTurn') ?? [];
      const messages = tables.get('core.agentMessage') ?? [];
      const parts = tables.get('core.agentMessagePart') ?? [];
      const participants = tables.get('core.agentChatThreadParticipant') ?? [];
      const channels = tables.get('core.agentChatChannel') ?? [];
      const channelMembers = tables.get('core.agentChatChannelMember') ?? [];
      const channelRoles = tables.get('core.agentChatChannelRole') ?? [];

      const runThreads = threads.filter((thread) => thread.workflowRunId);

      expect(threads).toHaveLength(threadCount);
      expect(runThreads).toHaveLength(runThreadCount);
      expect(messages).toHaveLength(messageCount);
      // The waiting run's last message carries its text and the question.
      expect(parts).toHaveLength(messageCount + runThreadCount / 2);
      expect(turns).toHaveLength(turnCount);
      expect(participants).toHaveLength(participantCount);
      expect(channels).toHaveLength(channelCount);
      expect(channelMembers).toHaveLength(channelMemberCount);
      expect(channelRoles).toHaveLength(channelRoleCount);
      for (const channelRole of channelRoles) {
        expect(channelRole).toEqual(
          expect.objectContaining({ roleId: 'role-id', workspaceId }),
        );
        expect(channels).toContainEqual(
          expect.objectContaining({ id: channelRole.channelId }),
        );
      }
      for (const thread of threads) {
        if (thread.channelId) {
          expect(channels).toContainEqual(
            expect.objectContaining({ id: thread.channelId, workspaceId }),
          );
        }
      }
      for (const channelMember of channelMembers) {
        expect(channels).toContainEqual(
          expect.objectContaining({ id: channelMember.channelId }),
        );
      }
      for (const thread of threads) {
        expect(participants).toContainEqual(
          expect.objectContaining({
            threadId: thread.id,
            userWorkspaceId: threads[0].userWorkspaceId,
            role: 'owner',
            workspaceId,
          }),
        );
      }
      for (const message of messages) {
        const isRunPrompt = runThreads.some(
          (thread) => thread.id === message.threadId,
        );

        if (message.role === 'user' && !isRunPrompt) {
          expect(participants).toContainEqual(
            expect.objectContaining({
              threadId: message.threadId,
              userWorkspaceId: message.authorUserWorkspaceId,
            }),
          );
        } else {
          expect(message.authorUserWorkspaceId).toBeNull();
        }
      }
      for (const thread of runThreads) {
        expect(thread.workflowStepId).toBeDefined();
        expect(participants).toContainEqual(
          expect.objectContaining({ threadId: thread.id, role: 'owner' }),
        );
      }
      const pendingParts = parts.filter(
        (part) => part.toolName === 'ask_questions',
      );

      expect(pendingParts).toHaveLength(runThreadCount / 2);
      for (const part of pendingParts) {
        expect(
          threads.find(
            (thread) => thread.pendingQuestionMessageId === part.messageId,
          ),
        ).toBeDefined();
      }
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'id = :threadId AND "workspaceId" = :workspaceId',
        { threadId: threads[0].id, workspaceId },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('title IS NULL');
      expect(new Set(turns.map((turn) => turn.id)).size).toBe(turns.length);
      for (const message of messages) {
        expect(threads).toContainEqual(
          expect.objectContaining({ id: message.threadId, workspaceId }),
        );
        expect(turns).toContainEqual(
          expect.objectContaining({
            id: message.turnId,
            threadId: message.threadId,
            workspaceId,
          }),
        );
      }
      for (const turn of turns) {
        const firstMessage = messages.find(
          (message) => message.turnId === turn.id,
        );

        expect(turn.createdAt).toEqual(firstMessage?.createdAt);
      }
      for (const part of parts) {
        expect(messages).toContainEqual(
          expect.objectContaining({ id: part.messageId, workspaceId }),
        );
      }
    },
  );
});
