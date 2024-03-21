import { Injectable } from '@nestjs/common';

import { ColumnType } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

import {
  WorkspaceTableStructure,
  WorkspaceTableStructureResult,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-table-definition.interface';
import {
  FieldMetadataDefaultValue,
  FieldMetadataFunctionDefaultValue,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { serializeFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-function-default-value.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { isFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/is-function-default-value.util';
import { FieldMetadataDefaultValueFunctionNames } from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';

@Injectable()
export class DatabaseStructureService {
  constructor(private readonly typeORMService: TypeORMService) {}

  async getWorkspaceTableColumns(
    schemaName: string,
    tableName: string,
  ): Promise<WorkspaceTableStructure[]> {
    const mainDataSource = this.typeORMService.getMainDataSource();
    const results = await mainDataSource.query<
      WorkspaceTableStructureResult[]
    >(`
      WITH foreign_keys AS (
        SELECT
          kcu.table_schema AS schema_name,
          kcu.table_name AS table_name,
          kcu.column_name AS column_name,
          tc.constraint_name AS constraint_name
        FROM
          information_schema.key_column_usage AS kcu
        JOIN
          information_schema.table_constraints AS tc
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = '${schemaName}'
          AND tc.table_name = '${tableName}'
        ),
        unique_constraints AS (
          SELECT
            tc.table_schema AS schema_name,
            tc.table_name AS table_name,
            kcu.column_name AS column_name
          FROM
            information_schema.key_column_usage AS kcu
          JOIN
            information_schema.table_constraints AS tc
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE
            tc.constraint_type = 'UNIQUE'
            AND tc.table_schema = '${schemaName}'
            AND tc.table_name = '${tableName}'
        )
        SELECT
          c.table_schema AS "tableSchema",
          c.table_name AS "tableName",
          c.column_name AS "columnName",
          CASE 
            WHEN (c.data_type = 'USER-DEFINED') THEN c.udt_name 
            ELSE data_type
          END AS "dataType",
          c.is_nullable AS "isNullable",
          c.column_default AS "columnDefault",
          CASE
            WHEN pk.constraint_type = 'PRIMARY KEY' THEN 'TRUE'
            ELSE 'FALSE'
          END AS "isPrimaryKey",
          CASE
            WHEN fk.constraint_name IS NOT NULL THEN 'TRUE'
            ELSE 'FALSE'
          END AS "isForeignKey",
          CASE
            WHEN uc.column_name IS NOT NULL THEN 'TRUE'
            ELSE 'FALSE'
          END AS "isUnique",
          rc.update_rule AS "onUpdateAction",
          rc.delete_rule AS "onDeleteAction"
        FROM
          information_schema.columns AS c
        LEFT JOIN
          information_schema.constraint_column_usage AS ccu
          ON c.column_name = ccu.column_name
          AND c.table_name = ccu.table_name
          AND c.table_schema = ccu.table_schema
        LEFT JOIN
          information_schema.table_constraints AS pk
          ON pk.constraint_name = ccu.constraint_name
          AND pk.constraint_type = 'PRIMARY KEY'
          AND pk.table_name = c.table_name
          AND pk.table_schema = c.table_schema
        LEFT JOIN
          foreign_keys AS fk
          ON c.table_schema = fk.schema_name
          AND c.table_name = fk.table_name
          AND c.column_name = fk.column_name
        LEFT JOIN
          unique_constraints AS uc
          ON c.table_schema = uc.schema_name
          AND c.table_name = uc.table_name
          AND c.column_name = uc.column_name
        LEFT JOIN
          information_schema.referential_constraints AS rc
          ON rc.constraint_name = fk.constraint_name
          AND rc.constraint_schema = '${schemaName}'
        WHERE
          c.table_schema = '${schemaName}'
          AND c.table_name = '${tableName}';
    `);

    if (!results || results.length === 0) {
      return [];
    }

    return results.map((item) => ({
      ...item,
      isNullable: item.isNullable === 'YES',
      isPrimaryKey: item.isPrimaryKey === 'TRUE',
      isForeignKey: item.isForeignKey === 'TRUE',
      isUnique: item.isUnique === 'TRUE',
    }));
  }

  async workspaceColumnExist(
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const mainDataSource = this.typeORMService.getMainDataSource();
    const results = await mainDataSource.query(
      `SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1
        AND table_name = $2
        AND column_name = $3`,
      [schemaName, tableName, columnName],
    );

    return results.length >= 1;
  }

  getPostgresDataType(fieldMetadata: FieldMetadataEntity): string {
    const typeORMType = fieldMetadataTypeToColumnType(fieldMetadata.type);
    const mainDataSource = this.typeORMService.getMainDataSource();

    // Compute enum name to compare data type properly
    if (typeORMType === 'enum') {
      const objectName = fieldMetadata.object?.nameSingular;
      const prefix = fieldMetadata.isCustom ? '_' : '';
      const fieldName = fieldMetadata.name;

      return `${objectName}_${prefix}${fieldName}_enum`;
    }

    return mainDataSource.driver.normalizeType({
      type: typeORMType,
    });
  }

  getFieldMetadataTypeFromPostgresDataType(
    postgresDataType: string,
  ): FieldMetadataType | null {
    const mainDataSource = this.typeORMService.getMainDataSource();
    const types = Object.values(FieldMetadataType).filter((type) => {
      // We're skipping composite and relation types, as they're not directly mapped to a column type
      if (isCompositeFieldMetadataType(type)) {
        return false;
      }

      if (isRelationFieldMetadataType(type)) {
        return false;
      }

      return true;
    });

    for (const type of types) {
      const typeORMType = fieldMetadataTypeToColumnType(
        FieldMetadataType[type],
      ) as ColumnType;
      const dataType = mainDataSource.driver.normalizeType({
        type: typeORMType,
      });

      if (postgresDataType === dataType) {
        return FieldMetadataType[type];
      }
    }

    return null;
  }

  getPostgresDefault(
    fieldMetadataType: FieldMetadataType,
    defaultValue:
      | FieldMetadataDefaultValue
      // Old format for default values
      // TODO: Should be removed once all default values are migrated
      | { type: FieldMetadataDefaultValueFunctionNames }
      | null,
  ): string | null | undefined {
    const typeORMType = fieldMetadataTypeToColumnType(
      fieldMetadataType,
    ) as ColumnType;
    const mainDataSource = this.typeORMService.getMainDataSource();
    let value =
      defaultValue && 'value' in defaultValue ? defaultValue.value : null;

    // Old format for default values
    // TODO: Should be removed once all default values are migrated
    if (defaultValue && 'type' in defaultValue) {
      return this.computeFunctionDefaultValue(defaultValue.type);
    }

    if (isFunctionDefaultValue(value)) {
      return this.computeFunctionDefaultValue(value);
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    // Remove leading and trailing single quotes for string default values as it's already handled by TypeORM
    if (typeof value === 'string' && value.match(/^'.*'$/)) {
      value = value.replace(/^'/, '').replace(/'$/, '');
    }

    return mainDataSource.driver.normalizeDefault({
      type: typeORMType,
      default: value,
      isArray: false,
      // Workaround to use normalizeDefault without a complete ColumnMetadata object
    } as ColumnMetadata);
  }

  private computeFunctionDefaultValue(
    value: FieldMetadataFunctionDefaultValue['value'],
  ) {
    const serializedDefaultValue = serializeFunctionDefaultValue(value);

    // Special case for uuid_generate_v4() default value
    if (serializedDefaultValue === 'public.uuid_generate_v4()') {
      return 'uuid_generate_v4()';
    }

    return serializedDefaultValue;
  }
}
