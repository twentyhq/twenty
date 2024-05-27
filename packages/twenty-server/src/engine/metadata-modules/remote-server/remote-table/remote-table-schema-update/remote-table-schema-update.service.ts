import { Injectable } from '@nestjs/common';

import camelCase from 'lodash.camelcase';

import { getForeignTableColumnName as convertToForeignTableColumnName } from 'src/engine/metadata-modules/remote-server/remote-table/foreign-table/utils/get-foreign-table-column-name.util';
import { DistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table';
import { DistantTableUpdate } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { fetchTableColumns } from 'src/engine/metadata-modules/remote-server/remote-table/utils/fetch-table-columns.util';
import { PostgresTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/types/postgres-table-schema-column';
import {
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  mapUdtNameToFieldType,
  mapUdtNameToFieldSettings,
} from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

@Injectable()
export class RemoteTableSchemaUpdateService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  public computeForeignTableColumnsUpdates = (
    foreignTableColumns: PostgresTableSchemaColumn[],
    distantTableColumns: PostgresTableSchemaColumn[],
  ): WorkspaceMigrationColumnAction[] => {
    const { columnsAdded, columnsDeleted } = this.compareForeignTableColumns(
      foreignTableColumns,
      distantTableColumns,
    );
    const columnsAddedUpdates: WorkspaceMigrationColumnCreate[] =
      columnsAdded.map((columnAdded) => ({
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: columnAdded.name,
        columnType: columnAdded.type,
      }));

    const columnsDeletedUpdates: WorkspaceMigrationColumnDrop[] =
      columnsDeleted.map((columnDeleted) => ({
        action: WorkspaceMigrationColumnActionType.DROP,
        columnName: columnDeleted,
      }));

    return [...columnsAddedUpdates, ...columnsDeletedUpdates];
  };

  public async getSchemaUpdatesBetweenForeignAndDistantTables({
    workspaceId,
    remoteTables,
    distantTables,
  }: {
    workspaceId: string;
    remoteTables: RemoteTableEntity[];
    distantTables: DistantTables;
  }): Promise<{ [tablename: string]: DistantTableUpdate[] }> {
    const updates = {};

    for (const remoteTable of remoteTables) {
      const distantTable = distantTables[remoteTable.distantTableName];
      const tableName = remoteTable.distantTableName;

      if (!distantTable) {
        updates[tableName] = [DistantTableUpdate.TABLE_DELETED];
        continue;
      }

      const foreignTable = await fetchTableColumns(
        this.workspaceDataSourceService,
        workspaceId,
        remoteTable.localTableName,
      );

      const { columnsAdded, columnsDeleted } = this.compareForeignTableColumns(
        foreignTable,
        distantTable,
      );

      if (columnsAdded.length > 0) {
        updates[tableName] = [
          ...(updates[tableName] || []),
          DistantTableUpdate.COLUMNS_ADDED,
        ];
      }
      if (columnsDeleted.length > 0) {
        updates[tableName] = [
          ...(updates[tableName] || []),
          DistantTableUpdate.COLUMNS_DELETED,
        ];
      }
    }

    return updates;
  }

  public async updateRemoteTableFieldsMetadata() {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: remoteTable.localTableName },
      });

    for (const column of distantTableColumns) {
      const columnName = camelCase(column.columnName);

      try {
        const field = await this.fieldMetadataService.createOne({
          name: columnName,
          label: camelToTitleCase(columnName),
          description: 'Field of remote',
          type: mapUdtNameToFieldType(column.udtName),
          workspaceId: workspaceId,
          objectMetadataId: objectMetadata.id,
          isRemoteCreation: true,
          isNullable: true,
          icon: 'IconPlug',
          settings: mapUdtNameToFieldSettings(column.udtName),
        } satisfies CreateFieldInput);
      } catch (error) {
        this.logger.error(
          `Could not create field ${columnName} for remote table ${localTableNameSingular}: ${error}`,
        );
      }
    }
  }

  private compareForeignTableColumns = (
    foreignTableColumns: PostgresTableSchemaColumn[],
    distantTableColumns: PostgresTableSchemaColumn[],
  ) => {
    const foreignTableColumnNames = new Set(
      foreignTableColumns.map((column) => column.columnName),
    );
    const distantTableColumnsWithConvertedName = distantTableColumns.map(
      (column) => {
        return {
          name: convertToForeignTableColumnName(column.columnName),
          type: column.dataType,
        };
      },
    );

    const columnsAdded = distantTableColumnsWithConvertedName.filter(
      (column) => !foreignTableColumnNames.has(column.name),
    );
    const columnsDeleted = Array.from(foreignTableColumnNames).filter(
      (columnName) =>
        !distantTableColumnsWithConvertedName
          .map((column) => column.name)
          .includes(columnName),
    );

    return {
      columnsAdded,
      columnsDeleted,
    };
  };
}
