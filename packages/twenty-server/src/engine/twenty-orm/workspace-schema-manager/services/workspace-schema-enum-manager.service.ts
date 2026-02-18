import { type QueryRunner } from 'typeorm';

import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import {
  escapeIdentifier,
  escapeLiteral,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export class WorkspaceSchemaEnumManagerService {
  async createEnum({
    queryRunner,
    schemaName,
    enumName,
    values,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    enumName: string;
    values: string[];
  }): Promise<void> {
    if (values.length === 0) {
      throw new WorkspaceSchemaManagerException(
        `Cannot create enum with no values`,
        WorkspaceSchemaManagerExceptionCode.ENUM_OPERATION_FAILED,
      );
    }

    const sanitizedValues = values
      .map((value) => escapeLiteral(value.toString()))
      .join(', ');

    const sql = `CREATE TYPE ${escapeIdentifier(schemaName)}.${escapeIdentifier(enumName)} AS ENUM (${sanitizedValues})`;

    await queryRunner.query(sql);
  }

  async dropEnum({
    queryRunner,
    schemaName,
    enumName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    enumName: string;
  }): Promise<void> {
    const sql = `DROP TYPE IF EXISTS ${escapeIdentifier(schemaName)}.${escapeIdentifier(enumName)}`;

    await queryRunner.query(sql);
  }

  async renameEnum({
    queryRunner,
    schemaName,
    oldEnumName,
    newEnumName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    oldEnumName: string;
    newEnumName: string;
  }): Promise<void> {
    const sql = `ALTER TYPE ${escapeIdentifier(schemaName)}.${escapeIdentifier(oldEnumName)} RENAME TO ${escapeIdentifier(newEnumName)}`;

    await queryRunner.query(sql);
  }

  async addEnumValue({
    queryRunner,
    schemaName,
    enumName,
    value,
    beforeValue,
    afterValue,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    enumName: string;
    value: string;
    beforeValue?: string;
    afterValue?: string;
  }): Promise<void> {
    let sql = `ALTER TYPE ${escapeIdentifier(schemaName)}.${escapeIdentifier(enumName)} ADD VALUE ${escapeLiteral(value)}`;

    if (beforeValue) {
      sql += ` BEFORE ${escapeLiteral(beforeValue)}`;
    } else if (afterValue) {
      sql += ` AFTER ${escapeLiteral(afterValue)}`;
    }

    await queryRunner.query(sql);
  }

  async renameEnumValue({
    queryRunner,
    schemaName,
    enumName,
    oldValue,
    newValue,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    enumName: string;
    oldValue: string;
    newValue: string;
  }): Promise<void> {
    const sql = `ALTER TYPE ${escapeIdentifier(schemaName)}.${escapeIdentifier(enumName)} RENAME VALUE ${escapeLiteral(oldValue)} TO ${escapeLiteral(newValue)}`;

    await queryRunner.query(sql);
  }

  async alterEnumValues({
    queryRunner,
    schemaName,
    tableName,
    columnDefinition,
    enumValues,
    oldToNewEnumOptionMap,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnDefinition: WorkspaceSchemaColumnDefinition;
    enumValues: string[];
    oldToNewEnumOptionMap: Record<string, string>;
  }): Promise<void> {
    const isTransactionAlreadyActive = queryRunner.isTransactionActive;

    if (!isTransactionAlreadyActive) {
      await queryRunner.startTransaction();
    }

    if (!enumValues || enumValues.length === 0) {
      throw new WorkspaceSchemaManagerException(
        `Cannot alter enum values for column ${columnDefinition.name} because it has no enum values`,
        WorkspaceSchemaManagerExceptionCode.ENUM_OPERATION_FAILED,
      );
    }

    try {
      const columnName = columnDefinition.name;

      const enumName = computePostgresEnumName({
        tableName,
        columnName,
      });

      const oldEnumName = `${enumName}_old`;

      await this.renameEnum({
        queryRunner,
        schemaName,
        oldEnumName: enumName,
        newEnumName: oldEnumName,
      });

      await this.createEnum({
        queryRunner,
        schemaName,
        enumName,
        values: enumValues,
      });

      const oldColumnName = `${columnName}_old`;

      await this.renameColumn({
        queryRunner,
        schemaName,
        tableName,
        oldColumnName: columnName,
        newColumnName: oldColumnName,
      });

      await this.createColumnUsingEnum({
        queryRunner,
        schemaName,
        tableName,
        columnDefinition,
        enumTypeName: enumName,
      });

      if (
        oldToNewEnumOptionMap &&
        Object.keys(oldToNewEnumOptionMap).length > 0
      ) {
        await this.migrateEnumData({
          queryRunner,
          schemaName,
          tableName,
          oldColumnName,
          newColumnName: columnName,
          oldToNewEnumOptionMap,
          columnDefinition,
          oldEnumTypeName: oldEnumName,
        });
      }

      await this.dropColumn({
        queryRunner,
        schemaName,
        tableName,
        columnName: oldColumnName,
      });
      await this.dropEnum({ queryRunner, schemaName, enumName: oldEnumName });

      if (!isTransactionAlreadyActive) {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      if (!isTransactionAlreadyActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
      }
      throw error;
    }
  }

  private async renameColumn({
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
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} RENAME COLUMN ${escapeIdentifier(oldColumnName)} TO ${escapeIdentifier(newColumnName)}`;

    await queryRunner.query(sql);
  }

  private async createColumnUsingEnum({
    queryRunner,
    schemaName,
    tableName,
    columnDefinition,
    enumTypeName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnDefinition: WorkspaceSchemaColumnDefinition;
    enumTypeName: string;
  }): Promise<void> {
    const columnDef = buildSqlColumnDefinition({
      ...columnDefinition,
      type: `${escapeIdentifier(schemaName)}.${escapeIdentifier(enumTypeName)}`,
    });

    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ADD COLUMN ${columnDef}`;

    await queryRunner.query(sql);
  }

  private async dropColumn({
    queryRunner,
    schemaName,
    tableName,
    columnName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnName: string;
  }): Promise<void> {
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} DROP COLUMN ${escapeIdentifier(columnName)}`;

    await queryRunner.query(sql);
  }

  private async migrateEnumData({
    queryRunner,
    schemaName,
    tableName,
    oldColumnName,
    newColumnName,
    oldToNewEnumOptionMap,
    columnDefinition,
    oldEnumTypeName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    oldColumnName: string;
    newColumnName: string;
    oldEnumTypeName: string;
    oldToNewEnumOptionMap: Record<string, string>;
    columnDefinition: WorkspaceSchemaColumnDefinition;
  }): Promise<void> {
    const newEnumTypeName = computePostgresEnumName({
      tableName,
      columnName: newColumnName,
    });

    const escapedSchema = escapeIdentifier(schemaName);
    const escapedTable = escapeIdentifier(tableName);
    const escapedOldColumn = escapeIdentifier(oldColumnName);
    const escapedNewColumn = escapeIdentifier(newColumnName);
    const escapedNewEnumType = `${escapedSchema}.${escapeIdentifier(newEnumTypeName)}`;

    const caseStatements = Object.entries(oldToNewEnumOptionMap)
      .map(
        ([oldEnumOption, newEnumOption]) =>
          `WHEN ${escapeLiteral(oldEnumOption)} THEN ${escapeLiteral(newEnumOption)}::${escapedNewEnumType}`,
      )
      .join(' ');
    const mappedValuesCondition = Object.keys(oldToNewEnumOptionMap)
      .map((oldValue) => escapeLiteral(oldValue))
      .join(', ');

    const sqlQuery = columnDefinition.isArray
      ? this.updateArrayEnum({
          escapedSchema,
          escapedTable,
          escapedOldColumn,
          escapedNewColumn,
          escapedNewEnumType,
          escapedOldEnumType: `${escapedSchema}.${escapeIdentifier(oldEnumTypeName)}`,
          caseStatements,
          mappedValuesCondition,
        })
      : this.updateAtomicEnum({
          escapedSchema,
          escapedTable,
          escapedOldColumn,
          escapedNewColumn,
          caseStatements,
          mappedValuesCondition,
        });

    await queryRunner.query(sqlQuery);
  }

  private updateArrayEnum({
    escapedNewColumn,
    escapedOldColumn,
    escapedSchema,
    escapedTable,
    escapedNewEnumType,
    escapedOldEnumType,
    caseStatements,
    mappedValuesCondition,
  }: {
    escapedSchema: string;
    escapedTable: string;
    escapedOldColumn: string;
    escapedNewColumn: string;
    escapedNewEnumType: string;
    escapedOldEnumType: string;
    caseStatements: string;
    mappedValuesCondition: string;
  }) {
    return `
          UPDATE ${escapedSchema}.${escapedTable}
          SET ${escapedNewColumn} = (
            SELECT array_agg(
              CASE unnest_value::text
                ${caseStatements}
                ELSE unnest_value::text::${escapedNewEnumType}
              END
            )
            FROM unnest(${escapedOldColumn}) AS unnest_value
          )
          WHERE ${escapedOldColumn} IS NOT NULL
            AND ${escapedOldColumn} && ARRAY[${mappedValuesCondition}]::${escapedOldEnumType}[]`;
  }

  private updateAtomicEnum({
    escapedNewColumn,
    escapedOldColumn,
    escapedSchema,
    escapedTable,
    caseStatements,
    mappedValuesCondition,
  }: {
    caseStatements: string;
    mappedValuesCondition: string;
    escapedSchema: string;
    escapedTable: string;
    escapedOldColumn: string;
    escapedNewColumn: string;
  }) {
    return `
          UPDATE ${escapedSchema}.${escapedTable}
          SET ${escapedNewColumn} =
            CASE ${escapedOldColumn}::text
              ${caseStatements}
            END
          WHERE ${escapedOldColumn} IS NOT NULL
            AND ${escapedOldColumn}::text IN (${mappedValuesCondition})`;
  }
}
