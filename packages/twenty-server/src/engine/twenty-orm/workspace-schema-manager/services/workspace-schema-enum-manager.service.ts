import { type QueryRunner } from 'typeorm';

import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

// TODO: upstream does not guarantee transactionality, implement IF EXISTS or equivalent for idempotency
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
      .map((value) => removeSqlDDLInjection(value.toString()))
      .map((value) => `'${value}'`)
      .join(', ');

    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);
    const sql = `CREATE TYPE "${safeSchemaName}"."${safeEnumName}" AS ENUM (${sanitizedValues})`;

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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);
    const sql = `DROP TYPE IF EXISTS "${safeSchemaName}"."${safeEnumName}"`;

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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeOldEnumName = removeSqlDDLInjection(oldEnumName);
    const safeNewEnumName = removeSqlDDLInjection(newEnumName);
    const sql = `ALTER TYPE "${safeSchemaName}"."${safeOldEnumName}" RENAME TO "${safeNewEnumName}"`;

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
    const sanitizedValue = removeSqlDDLInjection(value);
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);
    let sql = `ALTER TYPE "${safeSchemaName}"."${safeEnumName}" ADD VALUE '${sanitizedValue}'`;

    if (beforeValue) {
      const sanitizedBeforeValue = removeSqlDDLInjection(beforeValue);

      sql += ` BEFORE '${sanitizedBeforeValue}'`;
    } else if (afterValue) {
      const sanitizedAfterValue = removeSqlDDLInjection(afterValue);

      sql += ` AFTER '${sanitizedAfterValue}'`;
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
    const sanitizedOldValue = removeSqlDDLInjection(oldValue);
    const sanitizedNewValue = removeSqlDDLInjection(newValue);
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);
    const sql = `ALTER TYPE "${safeSchemaName}"."${safeEnumName}" RENAME VALUE '${sanitizedOldValue}' TO '${sanitizedNewValue}'`;

    await queryRunner.query(sql);
  }

  // TODO: optimize this to not create a temp enum and column if not necessary (e.g. using ADD VALUE)
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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeOldColumnName = removeSqlDDLInjection(oldColumnName);
    const safeNewColumnName = removeSqlDDLInjection(newColumnName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" RENAME COLUMN "${safeOldColumnName}" TO "${safeNewColumnName}"`;

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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);

    const columnDef = buildSqlColumnDefinition({
      ...columnDefinition,
      type: `"${safeSchemaName}"."${enumTypeName}"`,
    });

    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD COLUMN ${columnDef}`;

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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP COLUMN "${safeColumnName}"`;

    await queryRunner.query(sql);
  }

  // TODO: explore USING clause to avoid the need for this function
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

    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeOldColumnName = removeSqlDDLInjection(oldColumnName);
    const safeNewColumnName = removeSqlDDLInjection(newColumnName);
    const caseStatements = Object.entries(oldToNewEnumOptionMap)
      .map(
        ([oldEnumOption, newEnumOption]) =>
          `WHEN '${removeSqlDDLInjection(oldEnumOption)}' THEN '${removeSqlDDLInjection(newEnumOption)}'::"${safeSchemaName}"."${newEnumTypeName}"`,
      )
      .join(' ');
    const mappedValuesCondition = Object.keys(oldToNewEnumOptionMap)
      .map((oldValue) => `'${removeSqlDDLInjection(oldValue)}'`)
      .join(', ');

    const sqlQuery = columnDefinition.isArray
      ? this.updateArrayEnum({
          safeSchemaName,
          safeTableName,
          safeOldColumnName,
          safeNewColumnName,
          newEnumTypeName,
          oldEnumTypeName,
          caseStatements,
          mappedValuesCondition,
        })
      : this.updateAtomicEnum({
          safeSchemaName,
          safeTableName,
          safeOldColumnName,
          safeNewColumnName,
          caseStatements,
          mappedValuesCondition,
        });

    await queryRunner.query(sqlQuery);
  }

  private updateArrayEnum({
    safeNewColumnName,
    safeOldColumnName,
    safeSchemaName,
    safeTableName,
    newEnumTypeName,
    oldEnumTypeName,
    caseStatements,
    mappedValuesCondition,
  }: {
    safeSchemaName: string;
    safeTableName: string;
    safeOldColumnName: string;
    safeNewColumnName: string;
    newEnumTypeName: string;
    oldEnumTypeName: string;
    caseStatements: string;
    mappedValuesCondition: string;
  }) {
    return `
          UPDATE "${safeSchemaName}"."${safeTableName}" 
          SET "${safeNewColumnName}" = (
            SELECT array_agg(
              CASE unnest_value::text 
                ${caseStatements}
                ELSE unnest_value::text::"${safeSchemaName}"."${newEnumTypeName}"
              END
            )
            FROM unnest("${safeOldColumnName}") AS unnest_value
          )
          WHERE "${safeOldColumnName}" IS NOT NULL 
            AND "${safeOldColumnName}" && ARRAY[${mappedValuesCondition}]::"${safeSchemaName}"."${oldEnumTypeName}"[]`;
  }

  private updateAtomicEnum({
    safeNewColumnName,
    safeOldColumnName,
    safeSchemaName,
    safeTableName,
    caseStatements,
    mappedValuesCondition,
  }: {
    caseStatements: string;
    mappedValuesCondition: string;
    safeSchemaName: string;
    safeTableName: string;
    safeOldColumnName: string;
    safeNewColumnName: string;
  }) {
    return `
          UPDATE "${safeSchemaName}"."${safeTableName}" 
          SET "${safeNewColumnName}" = 
            CASE "${safeOldColumnName}"::text 
              ${caseStatements}
            END
          WHERE "${safeOldColumnName}" IS NOT NULL 
            AND "${safeOldColumnName}"::text IN (${mappedValuesCondition})`;
  }
}
