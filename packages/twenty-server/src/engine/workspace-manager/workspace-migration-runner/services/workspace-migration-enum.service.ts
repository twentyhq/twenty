import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { QueryRunner, TableColumn } from 'typeorm';
import { v4 } from 'uuid';

import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { unserializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/unserialize-default-value';
import {
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationRenamedEnum,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

@Injectable()
export class WorkspaceMigrationEnumService {
  async alterEnum(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
  ) {
    const oldEnumTypeName = await this.getEnumTypeName(
      queryRunner,
      schemaName,
      tableName,
      migrationColumn.currentColumnDefinition.columnName,
    );

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
    const tempEnumTypeName = `${oldEnumTypeName}_temp`;
    const newEnumTypeName = `${tableName}_${columnDefinition.columnName}_enum`;
    const enumValues =
      columnDefinition.enum?.map((enumValue) => {
        if (typeof enumValue === 'string') {
          return enumValue;
        }

        return enumValue.to;
      }) ?? [];
    const renamedEnumValues = columnDefinition.enum?.filter(
      (enumValue): enumValue is WorkspaceMigrationRenamedEnum =>
        typeof enumValue !== 'string',
    );

    const oldColumnName = `old_${v4()}`;

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
        enum: enumValues,
        enumName: newEnumTypeName,
        isArray: columnDefinition.isArray,
        isNullable: columnDefinition.isNullable,
        isUnique: columnDefinition.isUnique,
      }),
    );

    await this.migrateEnumValues(
      queryRunner,
      schemaName,
      migrationColumn,
      tableName,
      oldColumnName,
      enumValues,
      renamedEnumValues,
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

  private migrateEnumValue({
    value,
    renamedEnumValues,
    allEnumValues,
    defaultValueFallback,
  }: {
    value: string;
    renamedEnumValues?: WorkspaceMigrationRenamedEnum[];
    allEnumValues?: string[];
    defaultValueFallback?: string;
  }) {
    if (renamedEnumValues?.find((enumVal) => enumVal?.from === value)?.to) {
      return renamedEnumValues?.find((enumVal) => enumVal?.from === value)?.to;
    }

    if (allEnumValues?.includes(value)) {
      return value;
    }

    if (isDefined(defaultValueFallback)) {
      return defaultValueFallback;
    }

    return null;
  }

  private async migrateEnumValues(
    queryRunner: QueryRunner,
    schemaName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
    tableName: string,
    oldColumnName: string,
    enumValues: string[],
    renamedEnumValues?: WorkspaceMigrationRenamedEnum[],
  ) {
    const columnDefinition = migrationColumn.alteredColumnDefinition;

    const values = await queryRunner.query(
      `SELECT id, "${oldColumnName}" FROM "${schemaName}"."${tableName}"`,
    );

    for (const value of values) {
      let val = value[oldColumnName];

      if (/^\{.*\}$/.test(val)) {
        val = serializeDefaultValue(
          val
            .slice(1, -1)
            .split(',')
            .map((v: string) => v.trim())
            .map((v: string) =>
              this.migrateEnumValue({
                value: v,
                renamedEnumValues: renamedEnumValues,
                allEnumValues: enumValues,
              }),
            )
            .filter((v: string | null) => isDefined(v)),
        );
      } else if (typeof val === 'string') {
        const migratedValue = this.migrateEnumValue({
          value: val,
          renamedEnumValues: renamedEnumValues,
          allEnumValues: enumValues,
          defaultValueFallback: columnDefinition.isNullable
            ? null
            : unserializeDefaultValue(columnDefinition.defaultValue),
        });

        val = isDefined(migratedValue) ? `'${migratedValue}'` : null;
      }

      await queryRunner.query(`
        UPDATE "${schemaName}"."${tableName}"
        SET "${columnDefinition.columnName}" = ${val}
        WHERE id='${value.id}'
      `);
    }
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

  private async getEnumTypeName(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<string> {
    const [result] = await queryRunner.query(
      `SELECT udt_name, data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
      [schemaName, tableName, columnName],
    );

    if (!result) {
      throw new WorkspaceMigrationException(
        `Enum type name not found for column ${columnName} in table ${tableName} while trying to alter enum`,
        WorkspaceMigrationExceptionCode.ENUM_TYPE_NAME_NOT_FOUND,
      );
    }

    const enumTypeName =
      result.data_type === 'ARRAY'
        ? result.udt_name.replace(/^_/, '')
        : result.udt_name;

    return enumTypeName;
  }
}
