import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaEnumManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-enum-manager.service';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

// PostgreSQL truncates identifiers to 63 bytes (NAMEDATALEN - 1).
const POSTGRES_MAX_IDENTIFIER_LENGTH = 63;

// Extracts every double-quoted identifier from a SQL string.
const getQuotedIdentifiers = (sql: string): string[] =>
  [...sql.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

describe('WorkspaceSchemaEnumManagerService', () => {
  let service: WorkspaceSchemaEnumManagerService;
  let queryRunner: jest.Mocked<
    Pick<QueryRunner, 'query' | 'isTransactionActive'>
  >;
  let executedSql: string[];

  beforeEach(() => {
    service = new WorkspaceSchemaEnumManagerService();
    executedSql = [];
    queryRunner = {
      isTransactionActive: true,
      query: jest.fn((sql: string) => {
        executedSql.push(sql);

        return Promise.resolve();
      }),
    } as unknown as jest.Mocked<
      Pick<QueryRunner, 'query' | 'isTransactionActive'>
    >;
  });

  describe('addEnumValue', () => {
    it('emits a plain ADD VALUE statement', async () => {
      await service.addEnumValue({
        queryRunner: queryRunner as unknown as QueryRunner,
        schemaName: 'workspace_adhj7eaegq93fzpgbfpdm8ok3',
        enumName: 'company_createdBySource_enum',
        value: 'AGENT',
      });

      expect(executedSql).toHaveLength(1);
      expect(executedSql[0]).toContain('ADD VALUE ');
      expect(executedSql[0]).not.toContain('IF NOT EXISTS');
      expect(executedSql[0]).toContain("'AGENT'");
    });
  });

  describe('upsertEnumValue', () => {
    it('emits ADD VALUE IF NOT EXISTS', async () => {
      await service.upsertEnumValue({
        queryRunner: queryRunner as unknown as QueryRunner,
        schemaName: 'workspace_adhj7eaegq93fzpgbfpdm8ok3',
        enumName: 'company_createdBySource_enum',
        value: 'AGENT',
      });

      expect(executedSql).toHaveLength(1);
      expect(executedSql[0]).toContain('ADD VALUE IF NOT EXISTS');
      expect(executedSql[0]).toContain("'AGENT'");
    });
  });

  describe('alterEnumValues', () => {
    it('should not generate an enum rename whose target collides with the source when the name exceeds the identifier length limit', async () => {
      // Real-world case: long object + field names produce an enum name over
      // 63 bytes. Naively appending `_old` truncates the suffix away and the
      // RENAME target collides with the existing type.
      const columnDefinition: WorkspaceSchemaColumnDefinition = {
        name: 'insuranceCoverageClassifications',
        type: 'enum',
        isArray: true,
        isNullable: true,
      };

      await service.alterEnumValues({
        queryRunner: queryRunner as unknown as QueryRunner,
        schemaName: 'workspace_adhj7eaegq93fzpgbfpdm8ok3',
        tableName: '_personalInsurancePolicyOrQuote',
        columnDefinition,
        enumValues: ['OPTION_1', 'OPTION_2', 'OPTION_3'],
        oldToNewEnumOptionMap: {},
      });

      const renameStatement = executedSql.find(
        (sql) => sql.includes('ALTER TYPE') && sql.includes('RENAME TO'),
      );

      expect(renameStatement).toBeDefined();

      const [sourceEnum, targetEnum] = getQuotedIdentifiers(
        renameStatement as string,
      ).slice(-2);

      expect(targetEnum.length).toBeLessThanOrEqual(
        POSTGRES_MAX_IDENTIFIER_LENGTH,
      );
      // Once Postgres truncates both to 63 bytes they must still differ,
      // otherwise the rename targets the type's own name.
      expect(targetEnum.slice(0, POSTGRES_MAX_IDENTIFIER_LENGTH)).not.toEqual(
        sourceEnum.slice(0, POSTGRES_MAX_IDENTIFIER_LENGTH),
      );
    });

    it('should keep every emitted identifier within the Postgres length limit for long names', async () => {
      const columnDefinition: WorkspaceSchemaColumnDefinition = {
        name: 'insuranceCoverageClassifications',
        type: 'enum',
        isArray: true,
        isNullable: true,
      };

      await service.alterEnumValues({
        queryRunner: queryRunner as unknown as QueryRunner,
        schemaName: 'workspace_adhj7eaegq93fzpgbfpdm8ok3',
        tableName: '_personalInsurancePolicyOrQuote',
        columnDefinition,
        enumValues: ['OPTION_1', 'OPTION_2'],
        oldToNewEnumOptionMap: { OPTION_1: 'OPTION_1' },
      });

      const temporaryIdentifiers = executedSql
        .flatMap(getQuotedIdentifiers)
        .filter((identifier) => identifier.endsWith('_old'));

      expect(temporaryIdentifiers.length).toBeGreaterThan(0);
      temporaryIdentifiers.forEach((identifier) =>
        expect(identifier.length).toBeLessThanOrEqual(
          POSTGRES_MAX_IDENTIFIER_LENGTH,
        ),
      );
    });
  });
});
