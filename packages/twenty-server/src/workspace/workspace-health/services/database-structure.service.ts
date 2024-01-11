import { Injectable } from '@nestjs/common';

import { ColumnType } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

import { WorkspaceTableStructure } from 'src/workspace/workspace-health/interfaces/workspace-table-definition.interface';
import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { fieldMetadataTypeToColumnType } from 'src/metadata/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { serializeTypeDefaultValue } from 'src/metadata/field-metadata/utils/serialize-type-default-value.util';

@Injectable()
export class DatabaseStructureService {
  constructor(private readonly typeORMService: TypeORMService) {}

  async getWorkspaceTableColumns(
    schemaName: string,
    tableName: string,
  ): Promise<WorkspaceTableStructure[]> {
    const mainDataSource = this.typeORMService.getMainDataSource();

    return mainDataSource.query<WorkspaceTableStructure[]>(`
      SELECT
        c.table_schema as "tableSchema",
        c.table_name as "tableName",
        c.column_name as "columnName",
        c.data_type as "dataType",
        c.is_nullable as "isNullable",
        c.column_default as "columnDefault",
        CASE
            WHEN pk.constraint_type = 'PRIMARY KEY' THEN 'TRUE'
            ELSE 'FALSE'
        END as "isPrimaryKey"
      FROM
          information_schema.columns c
      LEFT JOIN
          information_schema.constraint_column_usage as ccu ON c.column_name = ccu.column_name AND c.table_name = ccu.table_name
      LEFT JOIN
          information_schema.table_constraints as pk ON pk.constraint_name = ccu.constraint_name AND pk.constraint_type = 'PRIMARY KEY'
      WHERE
          c.table_schema = '${schemaName}'
          AND c.table_name = '${tableName}';
    `);
  }

  getPostgresDataType(fieldMedataType: FieldMetadataType): string {
    const typeORMType = fieldMetadataTypeToColumnType(fieldMedataType);
    const mainDataSource = this.typeORMService.getMainDataSource();

    return mainDataSource.driver.normalizeType({
      type: typeORMType,
    });
  }

  getPostgresDefault(
    fieldMetadataType: FieldMetadataType,
    defaultValue: FieldMetadataDefaultValue | null,
  ): string | null | undefined {
    const typeORMType = fieldMetadataTypeToColumnType(
      fieldMetadataType,
    ) as ColumnType;
    const mainDataSource = this.typeORMService.getMainDataSource();

    if (defaultValue && 'type' in defaultValue) {
      const serializedDefaultValue = serializeTypeDefaultValue(defaultValue);

      // Special case for uuid_generate_v4() default value
      if (serializedDefaultValue === 'public.uuid_generate_v4()') {
        return 'uuid_generate_v4()';
      }

      return serializedDefaultValue;
    }

    const value =
      defaultValue && 'value' in defaultValue ? defaultValue.value : null;

    if (typeof value === 'number') {
      return value.toString();
    }

    return mainDataSource.driver.normalizeDefault({
      type: typeORMType,
      default: value,
      isArray: false,
      // Workaround to use normalizeDefault without a complete ColumnMetadata object
    } as ColumnMetadata);
  }
}
