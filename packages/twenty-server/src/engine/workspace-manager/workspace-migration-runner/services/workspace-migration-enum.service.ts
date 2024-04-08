import { Injectable } from '@nestjs/common';

import { QueryRunner, TableColumn } from 'typeorm';
import { v4 } from 'uuid';

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
    const oldEnumTypeName =
      `${tableName}_${migrationColumn.currentColumnDefinition.columnName}_enum`.toLowerCase();
    const tempEnumTypeName = `${oldEnumTypeName}_temp`;
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

    const oldColumnName = `${columnDefinition.columnName}_old_${v4()}`;

    // Rename old column
    await this.renameColumn(
      queryRunner,
      schemaName,
      tableName,
      columnDefinition.columnName,
      oldColumnName,
    );
    await this.renameEnumType(
      queryRunner,
      schemaName,
      oldEnumTypeName,
      tempEnumTypeName,
    );

    await queryRunner.addColumn(
      `${schemaName}.${tableName}`,
      new TableColumn({
        name: columnDefinition.columnName,
        type: columnDefinition.columnType,
        default: columnDefinition.defaultValue,
        enum: columnDefinition.enum?.filter(
          (value): value is string => typeof value === 'string',
        ),
        isArray: columnDefinition.isArray,
        isNullable: columnDefinition.isNullable,
      }),
    );

    // Migrate existing values to new values
    await this.migrateEnumValues(
      queryRunner,
      schemaName,
      tableName,
      migrationColumn,
    );

    await this.handleMissingEnumValues(
      queryRunner,
      schemaName,
      migrationColumn,
      tableName,
      oldColumnName,
      enumValues,
    );

    // Drop old column
    await queryRunner.query(`
      ALTER TABLE "${schemaName}"."${tableName}"
      DROP COLUMN "${oldColumnName}"
    `);
    // Drop temp enum type
    await this.dropOldEnumType(queryRunner, schemaName, tempEnumTypeName);
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
    migrationColumn: WorkspaceMigrationColumnAlter,
    tableName: string,
    oldColumnName: string,
    enumValues: string[],
  ) {
    const columnDefinition = migrationColumn.alteredColumnDefinition;

    const values = await queryRunner.query(
      `SELECT id, "${oldColumnName}" FROM "${schemaName}"."${tableName}"`,
    );

    values.map(async (value) => {
      let val = value[oldColumnName];

      if (/^\{.*\}$/.test(val)) {
        val = serializeDefaultValue(
          val
            .slice(1, -1)
            .split(',')
            .map((option) => option.trim())
            .filter((elem) => enumValues.includes(elem)),
        );
      } else if (typeof val === 'string') {
        val = `'${val}'`;
      }

      await queryRunner.query(`
        UPDATE "${schemaName}"."${tableName}"
        SET "${columnDefinition.columnName}" = ${val}
        WHERE id='${value.id}'
      `);
    });
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
      ALTER TYPE "${schemaName}"."${oldEnumTypeName}"
      RENAME TO "${newEnumTypeName}"
    `);
  }
}
