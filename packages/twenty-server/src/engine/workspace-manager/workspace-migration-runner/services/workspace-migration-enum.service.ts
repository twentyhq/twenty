import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { WorkspaceMigrationColumnAlter } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';

@Injectable()
export class WorkspaceMigrationEnumService {
  async alterEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
  ) {
    // Rename column name
    if (
      migrationColumn.currentColumnDefinition.columnName !==
      migrationColumn.alteredColumnDefinition.columnName
    ) {
      await this.renameColumn(
        queryRunner,
        schemaName,
        tableName,
        migrationColumn.currentColumnDefinition.columnName,
        migrationColumn.alteredColumnDefinition.columnName,
      );
    }

    const columnDefinition = migrationColumn.alteredColumnDefinition;
    const oldEnumTypeName = `${tableName}_${columnDefinition.columnName}_enum`;
    const newEnumTypeName = `${tableName}_${columnDefinition.columnName}_enum_new`;
    const enumValues =
      columnDefinition.enum?.map((enumValue) => {
        if (typeof enumValue === 'string') {
          return enumValue;
        }

        return enumValue.to;
      }) ?? [];

    if (!columnDefinition.isNullable && !columnDefinition.defaultValue) {
      columnDefinition.defaultValue = serializeDefaultValue(enumValues[0]);
    }

    // Create new enum type with new values
    await this.createNewEnumType(
      newEnumTypeName,
      queryRunner,
      schemaName,
      enumValues,
    );

    // Temporarily change column type to text
    await queryRunner.query(`
      ALTER TABLE "${schemaName}"."${tableName}"
      ALTER COLUMN "${columnDefinition.columnName}" TYPE TEXT
    `);

    // Migrate existing values to new values
    await this.migrateEnumValues(
      queryRunner,
      schemaName,
      tableName,
      migrationColumn,
    );

    // Update existing rows to handle missing values
    await this.handleMissingEnumValues(
      queryRunner,
      schemaName,
      tableName,
      migrationColumn,
      enumValues,
    );

    // Alter column type to new enum
    await this.updateColumnToNewEnum(
      queryRunner,
      schemaName,
      tableName,
      columnDefinition.columnName,
      newEnumTypeName,
      columnDefinition.defaultValue,
    );

    // Drop old enum type
    await this.dropOldEnumType(queryRunner, schemaName, oldEnumTypeName);

    // Rename new enum type to old enum type name
    await this.renameEnumType(
      queryRunner,
      schemaName,
      oldEnumTypeName,
      newEnumTypeName,
    );
  }

  private async renameColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    oldColumnName: string,
    newColumnName: string,
  ) {
    await queryRunner.query(`
      ALTER TABLE "${schemaName}"."${tableName}"
      RENAME COLUMN "${oldColumnName}" TO "${newColumnName}"
    `);
  }

  private async createNewEnumType(
    name: string,
    queryRunner: QueryRunner,
    schemaName: string,
    newValues: string[],
  ) {
    const enumValues = newValues
      .map((value) => `'${value.replace(/'/g, "''")}'`)
      .join(', ');

    await queryRunner.query(
      `CREATE TYPE "${schemaName}"."${name}" AS ENUM (${enumValues})`,
    );
  }

  private async migrateEnumValues(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
  ) {
    const columnDefinition = migrationColumn.alteredColumnDefinition;

    if (!columnDefinition.enum) {
      return;
    }

    for (const enumValue of columnDefinition.enum) {
      // Skip string values
      if (typeof enumValue === 'string') {
        continue;
      }
      await queryRunner.query(`
        UPDATE "${schemaName}"."${tableName}"
        SET "${columnDefinition.columnName}" = '${enumValue.to}'
        WHERE "${columnDefinition.columnName}" = '${enumValue.from}'
      `);
    }
  }

  private async handleMissingEnumValues(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
    enumValues: string[],
  ) {
    const columnDefinition = migrationColumn.alteredColumnDefinition;

    // Set missing values to null or default value
    let defaultValue = 'NULL';

    if (columnDefinition.defaultValue) {
      if (Array.isArray(columnDefinition.defaultValue)) {
        defaultValue = `ARRAY[${columnDefinition.defaultValue
          .map((e) => `'${e}'`)
          .join(', ')}]`;
      } else {
        defaultValue = columnDefinition.defaultValue;
      }
    }

    await queryRunner.query(`
      UPDATE "${schemaName}"."${tableName}"
      SET "${columnDefinition.columnName}" = ${defaultValue}
      WHERE "${columnDefinition.columnName}" NOT IN (${enumValues
        .map((e) => `'${e}'`)
        .join(', ')})
    `);
  }

  private async updateColumnToNewEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
    newEnumTypeName: string,
    newDefaultValue: string,
  ) {
    await queryRunner.query(
      `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT,
      ALTER COLUMN "${columnName}" TYPE "${schemaName}"."${newEnumTypeName}" USING ("${columnName}"::text::"${schemaName}"."${newEnumTypeName}"),
      ALTER COLUMN "${columnName}" SET DEFAULT ${newDefaultValue}`,
    );
  }

  private async dropOldEnumType(
    queryRunner: QueryRunner,
    schemaName: string,
    oldEnumTypeName: string,
  ) {
    await queryRunner.query(
      `DROP TYPE IF EXISTS "${schemaName}"."${oldEnumTypeName}"`,
    );
  }

  private async renameEnumType(
    queryRunner: QueryRunner,
    schemaName: string,
    oldEnumTypeName: string,
    newEnumTypeName: string,
  ) {
    await queryRunner.query(`
      ALTER TYPE "${schemaName}"."${newEnumTypeName}"
      RENAME TO "${oldEnumTypeName}"
    `);
  }
}
