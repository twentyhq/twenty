import { Injectable } from '@nestjs/common';

import { TableColumn } from 'typeorm';

import { WorkspaceTableStructure } from 'src/workspace/workspace-health/interfaces/workspace-table-definition.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { fieldMetadataTypeToColumnType } from 'src/metadata/workspace-migration/utils/field-metadata-type-to-column-type.util';

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
        c.table_schema,
        c.table_name,
        c.column_name,
        c.data_type,
        c.character_maximum_length,
        c.numeric_precision,
        c.is_nullable,
        pg_get_expr(d.adbin, d.adrelid) as column_default,
        CASE
            WHEN pk.constraint_type = 'PRIMARY KEY' THEN 'YES'
            ELSE 'NO'
        END as is_primary_key
      FROM
          information_schema.columns c
      LEFT JOIN
          information_schema.constraint_column_usage as ccu ON c.column_name = ccu.column_name AND c.table_name = ccu.table_name
      LEFT JOIN
          information_schema.table_constraints as pk ON pk.constraint_name = ccu.constraint_name AND pk.constraint_type = 'PRIMARY KEY'
      LEFT JOIN
          pg_attrdef as d ON d.adrelid = (SELECT oid FROM pg_class WHERE relname = c.table_name) AND d.adnum = c.ordinal_position
      WHERE
          c.table_schema = '${schemaName}'
          AND c.table_name = '${tableName}';
    `);
  }

  getPostgresDataType(fieldMedataType: FieldMetadataType): string {
    const typeORMType = fieldMetadataTypeToColumnType(fieldMedataType);
    const mainDataSource = this.typeORMService.getMainDataSource();

    // Workaround to get the postgres data type from a field metadata type
    const tempColumn = new TableColumn({
      name: 'tempColumn',
      type: typeORMType,
    });

    return mainDataSource.driver.normalizeType(tempColumn);
  }
}
