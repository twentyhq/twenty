import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { WorkspaceMigrationColumnAlter } from 'src/metadata/workspace-migration/workspace-migration.entity';

@Injectable()
export class WorkspaceMigrationEnumService {
  async alterEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
  ) {
    const oldEnumTypeName = `${tableName}_${migrationColumn.columnName}_enum`;
    const newEnumTypeName = `${tableName}_${migrationColumn.columnName}_enum_new`;
    const enumValues =
      migrationColumn.enum?.map((enumValue) => {
        if (typeof enumValue === 'string') {
          return enumValue;
        }

        return enumValue.to;
      }) ?? [];

    if (!migrationColumn.isNullable && !migrationColumn.defaultValue) {
      migrationColumn.defaultValue = migrationColumn.enum?.[0];
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
      ALTER COLUMN "${migrationColumn.columnName}" TYPE TEXT
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
      migrationColumn.columnName,
      newEnumTypeName,
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
    if (!migrationColumn.enum) {
      return;
    }

    for (const enumValue of migrationColumn.enum) {
      // Skip string values
      if (typeof enumValue === 'string') {
        continue;
      }

      await queryRunner.query(`
        UPDATE "${schemaName}"."${tableName}"
        SET "${migrationColumn.columnName}" = '${enumValue.to}'
        WHERE "${migrationColumn.columnName}" = '${enumValue.from}'
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
    // Set missing values to null or default value
    let defaultValue = 'NULL';

    if (migrationColumn.defaultValue) {
      if (Array.isArray(migrationColumn.defaultValue)) {
        defaultValue = `ARRAY[${migrationColumn.defaultValue
          .map((e) => `'${e}'`)
          .join(', ')}]`;
      } else {
        defaultValue = `'${migrationColumn.defaultValue}'`;
      }
    }

    await queryRunner.query(`
      UPDATE "${schemaName}"."${tableName}"
      SET "${migrationColumn.columnName}" = ${defaultValue}
      WHERE "${migrationColumn.columnName}" NOT IN (${enumValues
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
  ) {
    await queryRunner.query(
      `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${columnName}" TYPE "${schemaName}"."${newEnumTypeName}" USING ("${columnName}"::text::"${schemaName}"."${newEnumTypeName}")`,
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
