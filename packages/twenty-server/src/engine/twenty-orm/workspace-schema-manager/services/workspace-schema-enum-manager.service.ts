import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceSchemaEnumManagerService {
  async createEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    enumName: string,
    values: string[],
  ): Promise<void> {
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

  async enumExists(
    queryRunner: QueryRunner,
    schemaName: string,
    enumName: string,
  ): Promise<boolean> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);

    const result = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = $1 AND t.typname = $2 AND t.typtype = 'e'
      )`,
      [safeSchemaName, safeEnumName],
    );

    return result[0]?.exists || false;
  }

  // TODO: Not sure if we want to use that query or prefer to rely on the "from" values.
  async getEnumValues(
    queryRunner: QueryRunner,
    schemaName: string,
    enumName: string,
  ): Promise<string[]> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeEnumName = removeSqlDDLInjection(enumName);

    const result = await queryRunner.query(
      `SELECT e.enumlabel as value
       FROM pg_type t
       JOIN pg_namespace n ON n.oid = t.typnamespace
       JOIN pg_enum e ON t.oid = e.enumtypid
       WHERE n.nspname = $1 AND t.typname = $2
       ORDER BY e.enumsortorder`,
      [safeSchemaName, safeEnumName],
    );

    return result.map((row: { value: string }) => row.value);
  }

  async getEnumNameForColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<string | null> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);

    const result = await queryRunner.query(
      `SELECT udt_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
      [safeSchemaName, safeTableName, safeColumnName],
    );

    if (!result[0]) {
      return null;
    }

    const enumTypeName =
      result[0].data_type === 'ARRAY'
        ? result[0].udt_name.replace(/^_/, '')
        : result[0].udt_name;

    return enumTypeName;
  }

  async alterEnumValues(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
    newValues: string[],
    valueMapping?: Record<string, string>,
  ): Promise<void> {
    const isTransactionAlreadyActive = queryRunner.isTransactionActive;

    if (!isTransactionAlreadyActive) {
      await queryRunner.startTransaction();
    }

    try {
      const oldEnumName = await this.getEnumNameForColumn(
        queryRunner,
        schemaName,
        tableName,
        columnName,
      );

      if (!oldEnumName) {
        throw new TwentyORMException(
          `Enum type not found for column ${columnName}`,
          TwentyORMExceptionCode.ENUM_TYPE_NAME_NOT_FOUND,
        );
      }

      const tempEnumName = `${oldEnumName}_temp`;
      const safeTableName = removeSqlDDLInjection(tableName);
      const safeColumnName = removeSqlDDLInjection(columnName);
      const newEnumName = `${safeTableName}_${safeColumnName}_enum`;
      const oldColumnName = `old_${safeColumnName}`;

      // Rename existing column and enum
      await this.renameColumn(
        queryRunner,
        schemaName,
        tableName,
        columnName,
        oldColumnName,
      );
      await this.renameEnum(queryRunner, schemaName, oldEnumName, tempEnumName);

      // Create new enum and column
      await this.createEnum(queryRunner, schemaName, newEnumName, newValues);
      await this.addEnumColumn(
        queryRunner,
        schemaName,
        tableName,
        columnName,
        newEnumName,
      );

      // Migrate data
      await this.migrateEnumData(
        queryRunner,
        schemaName,
        tableName,
        oldColumnName,
        columnName,
        valueMapping || {},
      );

      // Clean up
      await this.dropColumn(queryRunner, schemaName, tableName, oldColumnName);
      await this.dropEnum(queryRunner, schemaName, tempEnumName);

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

  private async addEnumColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
    enumTypeName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);
    const safeEnumTypeName = removeSqlDDLInjection(enumTypeName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD COLUMN "${safeColumnName}" "${safeSchemaName}"."${safeEnumTypeName}"`;

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
