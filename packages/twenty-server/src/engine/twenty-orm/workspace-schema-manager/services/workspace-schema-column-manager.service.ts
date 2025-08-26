import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { sanitizeDefaultValue } from 'src/engine/twenty-orm/workspace-schema-manager/utils/sanitize-default-value.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

export class WorkspaceSchemaColumnManagerService {
  async addColumns({
    queryRunner,
    schemaName,
    tableName,
    columnDefinitions,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnDefinitions: WorkspaceSchemaColumnDefinition[];
  }): Promise<void> {
    if (columnDefinitions.length === 0) return;

    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const addColumnClauses = columnDefinitions.map(
      (column) => `ADD COLUMN ${buildSqlColumnDefinition(column)}`,
    );
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ${addColumnClauses.join(', ')}`;

    await queryRunner.query(sql);
  }

  async dropColumns({
    queryRunner,
    schemaName,
    tableName,
    columnNames,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnNames: string[];
  }): Promise<void> {
    if (columnNames.length === 0) return;

    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const dropClauses = columnNames.map((name) => {
      const safeName = removeSqlDDLInjection(name);

      return `DROP COLUMN IF EXISTS "${safeName}"`;
    });
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ${dropClauses.join(', ')}`;

    await queryRunner.query(sql);
  }

  async renameColumn({
    queryRunner,
    schemaName,
    tableName,
    oldColumnName,
    newColumnName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    oldColumnName: string;
    newColumnName: string;
  }): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeOldColumnName = removeSqlDDLInjection(oldColumnName);
    const safeNewColumnName = removeSqlDDLInjection(newColumnName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" RENAME COLUMN "${safeOldColumnName}" TO "${safeNewColumnName}"`;

    await queryRunner.query(sql);
  }

  async alterColumnDefault({
    queryRunner,
    schemaName,
    tableName,
    columnName,
    defaultValue,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnName: string;
    defaultValue?: string | number | boolean | null;
  }): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);

    const computeDefaultValueSqlQuery = () => {
      if (defaultValue === undefined) {
        return `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" DROP DEFAULT`;
      }

      if (defaultValue === null) {
        return `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" SET DEFAULT NULL`;
      }

      if (Array.isArray(defaultValue)) {
        const arrayValues = defaultValue
          .map((val) =>
            typeof val === 'string'
              ? `'${removeSqlDDLInjection(val)}'::${safeSchemaName}."${safeTableName}_${safeColumnName}_enum"`
              : val,
          )
          .join(',');
        return `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" SET DEFAULT ARRAY[${arrayValues}]`;
      }

      if (typeof defaultValue === 'string') {
        const safeDefaultValue = sanitizeDefaultValue(defaultValue);
        return `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" SET DEFAULT ${safeDefaultValue}::${safeSchemaName}."${safeTableName}_${safeColumnName}_enum"`;
      }

      return `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" SET DEFAULT '${defaultValue}'`;
    };

    const sql = computeDefaultValueSqlQuery();
    await queryRunner.query(sql);
  }
}
