
import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { buildColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

// TODO: upstream does not guarantee transactionality, implement IF EXISTS or equivalent for idempotency
export class WorkspaceSchemaEnumManagerService {
  async createEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    enumName: string,
    values: string[],
  ): Promise<void> {
    if (values.length === 0) {
      throw new Error(`Cannot create enum with no values`);
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

  async dropEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    enumName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);
    const sql = `DROP TYPE IF EXISTS "${safeSchemaName}"."${safeEnumName}"`;

    await queryRunner.query(sql);
  }

  async renameEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    oldEnumName: string,
    newEnumName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeOldEnumName = removeSqlDDLInjection(oldEnumName);
    const safeNewEnumName = removeSqlDDLInjection(newEnumName);
    const sql = `ALTER TYPE "${safeSchemaName}"."${safeOldEnumName}" RENAME TO "${safeNewEnumName}"`;

    await queryRunner.query(sql);
  }

  async addEnumValue(
    queryRunner: QueryRunner,
    schemaName: string,
    enumName: string,
    value: string,
    beforeValue?: string,
    afterValue?: string,
  ): Promise<void> {
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

  async renameEnumValue(
    queryRunner: QueryRunner,
    schemaName: string,
    enumName: string,
    oldValue: string,
    newValue: string,
  ): Promise<void> {
    const sanitizedOldValue = removeSqlDDLInjection(oldValue);
    const sanitizedNewValue = removeSqlDDLInjection(newValue);
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);
    const sql = `ALTER TYPE "${safeSchemaName}"."${safeEnumName}" RENAME VALUE '${sanitizedOldValue}' TO '${sanitizedNewValue}'`;

    await queryRunner.query(sql);
  }

  // TODO: optimize this to not create a temp enum and column if not necessary (e.g. using ADD VALUE)
  async alterEnumValues(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnDefinition: WorkspaceSchemaColumnDefinition,
    valueMapping?: Record<string, string>,
  ): Promise<void> {
    const isTransactionAlreadyActive = queryRunner.isTransactionActive;

    if (!isTransactionAlreadyActive) {
      await queryRunner.startTransaction();
    }

    if (!columnDefinition.enumValues || columnDefinition.enumValues.length === 0) {
      throw new Error(`Cannot alter enum values for column ${columnDefinition.name} because it has no enum values`);
    }

    try {
      const columnName = columnDefinition.name;

      const enumName = computePostgresEnumName({
        tableName,
        columnName,
      });

      const oldEnumName = `${enumName}_old`;

      await this.renameEnum(queryRunner, schemaName, enumName, oldEnumName);

      await this.createEnum(queryRunner, schemaName, enumName, columnDefinition.enumValues);

      const oldColumnName = `${columnName}_old`;

      await this.renameColumn(queryRunner, schemaName, tableName, columnName, oldColumnName);

      await this.createColumnUsingEnum(queryRunner, schemaName, tableName, columnDefinition, enumName);

      if (valueMapping && Object.keys(valueMapping).length > 0) {
        await this.migrateEnumData(
          queryRunner,
          schemaName,
          tableName,
          oldColumnName,
          columnName,
          valueMapping,
        );
      }

      await this.dropEnum(queryRunner, schemaName, oldEnumName);
      await this.dropColumn(queryRunner, schemaName, tableName, oldColumnName);

      if (!isTransactionAlreadyActive) {
        await queryRunner.commitTransaction();
      }

    } catch (error) {
      if (!isTransactionAlreadyActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    }
  }

  private async renameColumn(
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

  private async createColumnUsingEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnDefinition: WorkspaceSchemaColumnDefinition,
    enumTypeName: string,
  ): Promise<void> {
    const columnDef = buildColumnDefinition({
        ...columnDefinition,
        type: enumTypeName,
      }
    );
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD COLUMN ${columnDef}`;
    
    await queryRunner.query(sql);
  }

  private async dropColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP COLUMN "${safeColumnName}"`;

    await queryRunner.query(sql);
  }

  // TODO: explore USING clause to avoid the need for this function
  private async migrateEnumData(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    oldColumnName: string,
    newColumnName: string,
    valueMapping: Record<string, string>,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeOldColumnName = removeSqlDDLInjection(oldColumnName);
    const safeNewColumnName = removeSqlDDLInjection(newColumnName);

    const caseStatements = Object.entries(valueMapping)
      .map(
        ([oldVal, newVal]) =>
          `WHEN '${removeSqlDDLInjection(oldVal)}' THEN '${removeSqlDDLInjection(newVal)}'`,
      )
      .join(' ');

    const updateSql = `
      UPDATE "${safeSchemaName}"."${safeTableName}" 
      SET "${safeNewColumnName}" = 
        CASE "${safeOldColumnName}" 
          ${caseStatements}
          ELSE "${safeOldColumnName}"
        END
      WHERE "${safeOldColumnName}" IS NOT NULL`;

    await queryRunner.query(updateSql);
  }
}
