import { type QueryRunner } from 'typeorm';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { seedAgents } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';

type SeedRow = {
  id: string;
  threadId?: string;
  turnId?: string;
  messageId?: string;
  createdAt: Date;
};

const SCHEMA_NAME = 'workspace_seed';

describe('seedAgents', () => {
  it.each([
    [SEED_APPLE_WORKSPACE_ID, 3, 22, 11],
    [SEED_YCOMBINATOR_WORKSPACE_ID, 1, 4, 2],
  ])(
    'keeps messages, turns, and parts in their owning conversation for %s',
    async (workspaceId, threadCount, messageCount, turnCount) => {
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
        schemaName: SCHEMA_NAME,
        workspaceId,
        chatReferenceIds: {
          applicationId: 'application-id',
          objectMetadataId: 'object-id',
          roleId: 'role-id',
          viewId: 'view-id',
        },
      });

      const threads = tables.get(`${SCHEMA_NAME}.agentChatThread`) ?? [];
      const turns = tables.get(`${SCHEMA_NAME}.agentTurn`) ?? [];
      const messages = tables.get(`${SCHEMA_NAME}.agentMessage`) ?? [];
      const parts = tables.get(`${SCHEMA_NAME}.agentMessagePart`) ?? [];

      expect(threads).toHaveLength(threadCount);
      expect(messages).toHaveLength(messageCount);
      expect(parts).toHaveLength(messageCount);
      expect(turns).toHaveLength(turnCount);
      expect(queryBuilder.where).toHaveBeenCalledWith('id = :threadId', {
        threadId: threads[0].id,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('title IS NULL');
      expect(new Set(turns.map((turn) => turn.id)).size).toBe(turns.length);
      for (const message of messages) {
        expect(threads).toContainEqual(
          expect.objectContaining({ id: message.threadId }),
        );
        expect(turns).toContainEqual(
          expect.objectContaining({
            id: message.turnId,
            threadId: message.threadId,
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
          expect.objectContaining({ id: part.messageId }),
        );
      }
    },
  );
});
