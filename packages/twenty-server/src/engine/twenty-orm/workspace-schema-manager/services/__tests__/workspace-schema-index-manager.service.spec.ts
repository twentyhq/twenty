import { OrderByDirection } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

describe('WorkspaceSchemaIndexManagerService', () => {
  const indexManager = new WorkspaceSchemaIndexManagerService();

  const createIndexAndGetSql = async (
    index: WorkspaceSchemaIndexDefinition,
    concurrently = false,
  ): Promise<string> => {
    const query = jest.fn();

    await indexManager.createIndex({
      queryRunner: {
        isTransactionActive: false,
        query,
      } as unknown as QueryRunner,
      schemaName: 'workspace_test',
      tableName: '_contactLog',
      index,
      concurrently,
    });

    return query.mock.calls[0][0];
  };

  it('keeps columns without a direction as plain columns', async () => {
    expect(
      await createIndexAndGetSql({
        name: 'IDX_plain',
        columns: ['occurredOn', 'id'],
      }),
    ).toBe(
      'CREATE INDEX IF NOT EXISTS "IDX_plain" ON "workspace_test"."_contactLog" ("occurredOn", "id")',
    );
  });

  it('writes the sort order of each column that has one', async () => {
    expect(
      await createIndexAndGetSql({
        name: 'IDX_sorted',
        columns: ['occurredOn', 'position', 'id'],
        columnDirections: {
          occurredOn: OrderByDirection.DescNullsLast,
          position: OrderByDirection.AscNullsFirst,
        },
      }),
    ).toBe(
      'CREATE INDEX IF NOT EXISTS "IDX_sorted" ON "workspace_test"."_contactLog" ("occurredOn" DESC NULLS LAST, "position" ASC NULLS FIRST, "id")',
    );
  });

  it('writes the sort order when building concurrently', async () => {
    expect(
      await createIndexAndGetSql(
        {
          name: 'IDX_concurrent',
          columns: ['occurredOn'],
          columnDirections: { occurredOn: OrderByDirection.DescNullsFirst },
        },
        true,
      ),
    ).toBe(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_concurrent" ON "workspace_test"."_contactLog" ("occurredOn" DESC NULLS FIRST)',
    );
  });
});
