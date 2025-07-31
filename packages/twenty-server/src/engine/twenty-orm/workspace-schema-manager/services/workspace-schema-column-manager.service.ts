import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { sanitizeDefaultValue } from 'src/engine/twenty-orm/workspace-schema-manager/utils/sanitize-default-value.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceSchemaColumnManagerService {
  async addColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    column: WorkspaceSchemaColumnDefinition,
  ): Promise<void> {
    const columnDef = this.buildColumnDefinition(column);
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD COLUMN ${columnDef}`;

    await queryRunner.query(sql);
  }

  async dropColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP COLUMN IF EXISTS "${safeColumnName}"`;

    await queryRunner.query(sql);
  }

  async dropColumns(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnNames: string[],
  ): Promise<void> {
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

  async renameColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    oldColumnName: string,
    newColumnName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeOldColumnName = removeSqlDDLInjection(oldColumnName);
    const safeNewColumnName = removeSqlDDLInjection(newColumnName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" RENAME COLUMN "${safeOldColumnName}" TO "${safeNewColumnName}"`;

    await queryRunner.query(sql);
  }

  async alterColumnType(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
    newType: string,
    usingClause?: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);
    const safeNewType = removeSqlDDLInjection(newType);
    let sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" TYPE ${safeNewType}`;

    if (usingClause) {
      sql += ` USING ${usingClause}`;
    }

    await queryRunner.query(sql);
  }

  async alterColumnNullability(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
    isNullable: boolean,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);
    const action = isNullable ? 'DROP NOT NULL' : 'SET NOT NULL';
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" ${action}`;

    await queryRunner.query(sql);
  }

  async alterColumnDefault(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
    defaultValue?: string | number | boolean | null,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);
    let sql: string;

    if (defaultValue !== undefined) {
      if (typeof defaultValue === 'string') {
        const safeDefaultValue = sanitizeDefaultValue(defaultValue);

        sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" SET DEFAULT ${safeDefaultValue}`;
      } else {
        sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" SET DEFAULT ${defaultValue}`;
      }
    } else {
      sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER COLUMN "${safeColumnName}" DROP DEFAULT`;
    }

    await queryRunner.query(sql);
  }

  async columnExists(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);

    const result = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
      )`,
      [safeSchemaName, safeTableName, safeColumnName],
    );

    return result[0]?.exists || false;
  }

  private buildColumnDefinition(
    column: WorkspaceSchemaColumnDefinition,
  ): string {
    const safeName = removeSqlDDLInjection(column.name);
    const parts = [`"${safeName}"`];

    if (column.asExpression) {
      parts.push(`AS (${column.asExpression})`);
      if (column.generatedType) {
        parts.push(column.generatedType);
      }
    } else {
      const safeType = removeSqlDDLInjection(column.type);

      parts.push(column.isArray ? `${safeType}[]` : safeType);

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
    }

    return parts.join(' ');
  }
}
