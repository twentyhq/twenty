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
  createdAt: Date;
};

describe('seedAgents', () => {
  it.each([
    [SEED_APPLE_WORKSPACE_ID, 3, 22],
    [SEED_YCOMBINATOR_WORKSPACE_ID, 1, 4],
  ])(
    'keeps messages, turns, and parts in their owning conversation for %s',
    async (workspaceId, threadCount, messageCount) => {
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

      expect(threads).toHaveLength(threadCount);
      expect(messages).toHaveLength(messageCount);
      expect(parts).toHaveLength(messageCount);
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
