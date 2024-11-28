import { Test, TestingModule } from '@nestjs/testing';

import { DataSource, QueryRunner, TableColumn } from 'typeorm';

import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationEnumService } from 'src/engine/workspace-manager/workspace-migration-runner/services/workspace-migration-enum.service';

describe('WorkspaceMigrationEnumService', () => {
  let service: WorkspaceMigrationEnumService;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMigrationEnumService,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: () => ({
              query: jest.fn(),
              addColumn: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceMigrationEnumService>(
      WorkspaceMigrationEnumService,
    );
    queryRunner = module.get(DataSource).createQueryRunner();
  });

  describe('alterEnum', () => {
    it('should handle enum column alteration with renamed values', async () => {
      const mockMigrationColumn: WorkspaceMigrationColumnAlter = {
        action: WorkspaceMigrationColumnActionType.ALTER,
        currentColumnDefinition: {
          columnName: 'status',
          columnType: 'enum',
          enum: ['ACTIVE', 'INACTIVE'],
          isNullable: false,
          defaultValue: 'ACTIVE',
        },
        alteredColumnDefinition: {
          columnName: 'status',
          columnType: 'enum',
          enum: [
            { from: 'ACTIVE', to: 'ENABLED' },
            { from: 'INACTIVE', to: 'DISABLED' },
          ],
          isNullable: false,
          defaultValue: 'ENABLED',
        },
      };

      jest.spyOn(queryRunner, 'query').mockImplementation((query: string) => {
        if (query.includes('information_schema.columns')) {
          return Promise.resolve([{ udt_name: 'test_status_enum' }]);
        }
        if (query.includes('SELECT id')) {
          return Promise.resolve([
            { id: '1', status: 'ACTIVE' },
            { id: '2', status: 'INACTIVE' },
          ]);
        }

        return Promise.resolve();
      });

      await service.alterEnum(
        queryRunner,
        'test_schema',
        'test_table',
        mockMigrationColumn,
      );

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('information_schema.columns'),
        ['test_schema', 'test_table', 'status'],
      );
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('ALTER TYPE'),
      );
      expect(queryRunner.addColumn).toHaveBeenCalledWith(
        'test_schema.test_table',
        new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['ENABLED', 'DISABLED'],
          isNullable: false,
          default: 'ENABLED',
          enumName: 'test_table_status_enum',
        }),
      );
    });
  });
});
