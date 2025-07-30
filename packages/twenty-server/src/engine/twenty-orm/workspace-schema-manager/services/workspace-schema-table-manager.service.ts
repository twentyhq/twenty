import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { sanitizeDefaultValue } from 'src/engine/twenty-orm/workspace-schema-manager/utils/sanitize-default-value.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceSchemaTableManagerService {
  async createTable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columns?: Array<{
      name: string;
      type: string;
      isNullable?: boolean;
      default?: string | number | boolean | null;
      isPrimary?: boolean;
      isUnique?: boolean;
      isArray?: boolean;
    }>,
  ): Promise<void> {
    const columnDefinitions =
      columns?.map((column) => {
        const safeName = removeSqlDDLInjection(column.name);
        const safeType = removeSqlDDLInjection(column.type);
        const parts = [
          `"${safeName}" ${column.isArray ? `${safeType}[]` : safeType}`,
        ];

        if (column.isPrimary) {
          parts.push('PRIMARY KEY');
        }

        if (column.isNullable === false) {
          parts.push('NOT NULL');
        }

        if (column.isUnique) {
          parts.push('UNIQUE');
        }

        if (column.default !== undefined) {
          if (typeof column.default === 'string') {
            const safeDefault = sanitizeDefaultValue(column.default);

            parts.push(`DEFAULT ${safeDefault}`);
          } else {
            parts.push(`DEFAULT ${column.default}`);
          }
        }

        return parts.join(' ');
      }) || [];

    // Add default columns if no columns specified
    if (columnDefinitions.length === 0) {
      columnDefinitions.push('"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()');
    }

    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const sql = `CREATE TABLE IF NOT EXISTS "${safeSchemaName}"."${safeTableName}" (${columnDefinitions.join(', ')})`;

    await queryRunner.query(sql);
  }

  async dropTable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const sql = `DROP TABLE IF EXISTS "${safeSchemaName}"."${safeTableName}"`;

    await queryRunner.query(sql);
  }

  async renameTable(
    queryRunner: QueryRunner,
    schemaName: string,
    oldTableName: string,
    newTableName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeOldTableName = removeSqlDDLInjection(oldTableName);
    const safeNewTableName = removeSqlDDLInjection(newTableName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeOldTableName}" RENAME TO "${safeNewTableName}"`;

    await queryRunner.query(sql);
  }

  async tableExists(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<boolean> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);

    const result = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      )`,
      [safeSchemaName, safeTableName],
    );

    return result[0]?.exists || false;
  }
}
