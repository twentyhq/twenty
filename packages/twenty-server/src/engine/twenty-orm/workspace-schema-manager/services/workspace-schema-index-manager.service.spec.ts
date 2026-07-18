import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaManagerExceptionCode } from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';

describe('WorkspaceSchemaIndexManagerService', () => {
  const createQueryRunner = () =>
    ({
      isTransactionActive: false,
      query: jest.fn(),
    }) as unknown as jest.Mocked<QueryRunner>;

  it('reports duplicate values before creating a unique index', async () => {
    const queryRunner = createQueryRunner();
    queryRunner.query.mockResolvedValueOnce([{ name: 'Acme' }]);

    await expect(
      new WorkspaceSchemaIndexManagerService().createIndex({
        queryRunner,
        schemaName: 'workspace',
        tableName: 'company',
        index: {
          name: 'company_name_unique',
          columns: ['name'],
          isUnique: true,
        },
      }),
    ).rejects.toMatchObject({
      code: WorkspaceSchemaManagerExceptionCode.DUPLICATE_INDEX_VALUES,
      message: expect.stringContaining('name=Acme'),
    });

    expect(queryRunner.query).toHaveBeenCalledTimes(1);
    expect(queryRunner.query.mock.calls[0][0]).toContain('GROUP BY "name"');
  });

  it('creates a unique index when no duplicate values are found', async () => {
    const queryRunner = createQueryRunner();
    queryRunner.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    await new WorkspaceSchemaIndexManagerService().createIndex({
      queryRunner,
      schemaName: 'workspace',
      tableName: 'company',
      index: {
        name: 'company_name_unique',
        columns: ['name'],
        isUnique: true,
      },
    });

    expect(queryRunner.query).toHaveBeenCalledTimes(2);
    expect(queryRunner.query.mock.calls[1][0]).toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS',
    );
  });
});
