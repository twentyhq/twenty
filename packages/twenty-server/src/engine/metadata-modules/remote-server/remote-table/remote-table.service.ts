import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import { plural } from 'pluralize';
import { DataSource, Repository } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  RemoteServerEntity,
  type RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { DistantTableService } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service';
import { sortDistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/utils/sort-distant-tables.util';
import { type RemoteTableInput } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table-input';
import {
  DistantTableUpdate,
  RemoteTableStatus,
} from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import { ForeignTableService } from 'src/engine/metadata-modules/remote-server/remote-table/foreign-table/foreign-table.service';
import { RemoteTableSchemaUpdateService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import {
  RemoteTableException,
  RemoteTableExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.exception';
import { fetchTableColumns } from 'src/engine/metadata-modules/remote-server/remote-table/utils/fetch-table-columns.util';
import { getRemoteTableLocalName } from 'src/engine/metadata-modules/remote-server/remote-table/utils/get-remote-table-local-name.util';
import {
  mapUdtNameToFieldSettings,
  mapUdtNameToFieldType,
} from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { type PostgresTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/types/postgres-table-schema-column';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import {
  type WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { camelCase } from 'src/utils/camel-case';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

export class RemoteTableService {
  private readonly logger = new Logger(RemoteTableService.name);

  constructor(
    @InjectRepository(RemoteTableEntity)
    private readonly remoteTableRepository: Repository<RemoteTableEntity>,
    @InjectRepository(RemoteServerEntity)
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly dataSourceService: DataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly distantTableService: DistantTableService,
    private readonly foreignTableService: ForeignTableService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly remoteTableSchemaUpdateService: RemoteTableSchemaUpdateService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async findDistantTablesWithStatus(
    id: string,
    workspaceId: string,
    shouldFetchPendingSchemaUpdates?: boolean,
  ) {
    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new RemoteTableException(
        'Remote server does not exist',
        RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT,
      );
    }

    const currentRemoteTables = await this.findRemoteTablesByServerId({
      remoteServerId: id,
      workspaceId,
    });

    const currentRemoteTableDistantNames = currentRemoteTables.map(
      (remoteTable) => remoteTable.distantTableName,
    );

    const distantTables = await this.distantTableService.fetchDistantTables(
      remoteServer,
      workspaceId,
    );

    const distantTablesWithStatus = Object.keys(distantTables).map(
      (tableName) => ({
        name: tableName,
        schema: remoteServer.schema,
        status: currentRemoteTableDistantNames.includes(tableName)
          ? RemoteTableStatus.SYNCED
          : RemoteTableStatus.NOT_SYNCED,
      }),
    );

    if (!shouldFetchPendingSchemaUpdates) {
      return distantTablesWithStatus.sort(sortDistantTables);
    }

    const schemaPendingUpdates =
      await this.remoteTableSchemaUpdateService.getSchemaUpdatesBetweenForeignAndDistantTables(
        {
          workspaceId,
          remoteTables: currentRemoteTables,
          distantTables,
        },
      );

    const distantTablesWithPendingUpdates =
      this.getDistantTablesWithPendingUpdates(
        schemaPendingUpdates,
        distantTablesWithStatus,
        remoteServer.schema,
      );

    return distantTablesWithPendingUpdates.sort(sortDistantTables);
  }

  public async findRemoteTablesByServerId({
    remoteServerId,
    workspaceId,
  }: {
    remoteServerId: string;
    workspaceId: string;
  }) {
    return this.remoteTableRepository.find({
      where: {
        remoteServerId,
        workspaceId,
      },
    });
  }

  public async syncRemoteTable(input: RemoteTableInput, workspaceId: string) {
    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id: input.remoteServerId,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new RemoteTableException(
        'Remote server does not exist',
        RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT,
      );
    }

    const currentRemoteTableWithSameDistantName =
      await this.remoteTableRepository.findOne({
        where: {
          distantTableName: input.name,
          remoteServerId: remoteServer.id,
          workspaceId,
        },
      });

    if (currentRemoteTableWithSameDistantName) {
      throw new RemoteTableException(
        'Remote server does not exist',
        RemoteTableExceptionCode.REMOTE_TABLE_ALREADY_EXISTS,
      );
    }

    const dataSourceMetatada =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const { baseName: localTableBaseName, suffix: localTableSuffix } =
      await getRemoteTableLocalName(
        input.name,
        dataSourceMetatada.schema,
        this.coreDataSource,
      );

    const localTableName = localTableSuffix
      ? `${localTableBaseName}${localTableSuffix}`
      : localTableBaseName;

    const remoteTableEntity = this.remoteTableRepository.create({
      distantTableName: input.name,
      localTableName,
      workspaceId,
      remoteServerId: remoteServer.id,
    });

    const distantTableColumns =
      await this.distantTableService.getDistantTableColumns(
        remoteServer,
        workspaceId,
        input.name,
      );

    if (!distantTableColumns) {
      throw new RemoteTableException(
        'Remote server does not exist',
        RemoteTableExceptionCode.REMOTE_TABLE_NOT_FOUND,
      );
    }

    // We only support remote tables with an id column for now.
    const distantTableIdColumn = distantTableColumns.find(
      (column) => column.columnName === 'id',
    );

    if (!distantTableIdColumn) {
      throw new RemoteTableException(
        'Remote server does not exist',
        RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT,
      );
    }

    await this.foreignTableService.createForeignTable(
      workspaceId,
      localTableName,
      remoteServer,
      input.name,
      distantTableColumns,
    );

    await this.createRemoteTableMetadata(
      workspaceId,
      localTableBaseName,
      localTableSuffix,
      distantTableColumns,
      distantTableIdColumn,
      dataSourceMetatada.id,
    );

    await this.remoteTableRepository.save(remoteTableEntity);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    return {
      id: remoteTableEntity.id,
      name: input.name,
      schema: remoteServer.schema,
      status: RemoteTableStatus.SYNCED,
    };
  }

  public async unsyncRemoteTable(input: RemoteTableInput, workspaceId: string) {
    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id: input.remoteServerId,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new RemoteTableException(
        'Remote server does not exist',
        RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT,
      );
    }

    const remoteTable = await this.remoteTableRepository.findOne({
      where: {
        distantTableName: input.name,
        remoteServerId: remoteServer.id,
        workspaceId,
      },
    });

    if (!remoteTable) {
      throw new RemoteTableException(
        'Remote table does not exist',
        RemoteTableExceptionCode.REMOTE_TABLE_NOT_FOUND,
      );
    }

    await this.unsyncOne(workspaceId, remoteTable, remoteServer);

    return {
      name: input.name,
      schema: remoteServer.schema,
      status: RemoteTableStatus.NOT_SYNCED,
    };
  }

  public async unsyncAll(
    workspaceId: string,
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ) {
    const remoteTables = await this.remoteTableRepository.find({
      where: {
        remoteServerId: remoteServer.id,
        workspaceId,
      },
    });

    for (const remoteTable of remoteTables) {
      await this.unsyncOne(workspaceId, remoteTable, remoteServer);
    }
  }

  public async syncRemoteTableSchemaChanges(
    input: RemoteTableInput,
    workspaceId: string,
  ) {
    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id: input.remoteServerId,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new RemoteTableException(
        'Remote server does not exist',
        RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT,
      );
    }

    const remoteTable = await this.remoteTableRepository.findOne({
      where: {
        distantTableName: input.name,
        remoteServerId: remoteServer.id,
        workspaceId,
      },
    });

    if (!remoteTable) {
      throw new RemoteTableException(
        'Remote table does not exist',
        RemoteTableExceptionCode.REMOTE_TABLE_NOT_FOUND,
      );
    }

    const distantTableColumns =
      await this.distantTableService.getDistantTableColumns(
        remoteServer,
        workspaceId,
        remoteTable.distantTableName,
      );

    if (!distantTableColumns) {
      await this.unsyncOne(workspaceId, remoteTable, remoteServer);

      return {
        name: remoteTable.localTableName,
        status: RemoteTableStatus.NOT_SYNCED,
        schemaPendingUpdates: [],
      };
    }

    const foreignTableColumns = await fetchTableColumns(
      this.workspaceDataSourceService,
      workspaceId,
      remoteTable.localTableName,
    );

    const columnsUpdates =
      this.remoteTableSchemaUpdateService.computeForeignTableColumnsUpdates(
        foreignTableColumns,
        distantTableColumns,
      );

    if (isEmpty(columnsUpdates)) {
      this.logger.log(
        `No update to perform on table "${remoteTable.localTableName}" for workspace ${workspaceId}`,
      );

      return {
        name: remoteTable.localTableName,
        status: RemoteTableStatus.SYNCED,
        schemaPendingUpdates: [],
      };
    }

    const updatedTable = await this.updateForeignTableAndFieldsMetadata(
      remoteTable.localTableName,
      workspaceId,
      columnsUpdates,
    );

    return updatedTable;
  }

  private async unsyncOne(
    workspaceId: string,
    remoteTable: RemoteTableEntity,
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ) {
    const currentForeignTableNames =
      await this.foreignTableService.fetchForeignTableNamesWithinWorkspace(
        workspaceId,
        remoteServer.foreignDataWrapperId,
      );

    if (!currentForeignTableNames.includes(remoteTable.localTableName)) {
      throw new RemoteTableException(
        'Foreign table does not exist',
        RemoteTableExceptionCode.NO_FOREIGN_TABLES_FOUND,
      );
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: remoteTable.localTableName },
      });

    if (objectMetadata) {
      await this.objectMetadataService.deleteOneObject({
        deleteObjectInput: { id: objectMetadata.id },
        workspaceId,
      });
    }

    await this.foreignTableService.deleteForeignTable(
      remoteTable.localTableName,
      workspaceId,
    );

    await this.remoteTableRepository.delete(remoteTable.id);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );
  }

  private async createRemoteTableMetadata(
    workspaceId: string,
    localTableBaseName: string,
    localTableSuffix: number | undefined,
    distantTableColumns: PostgresTableSchemaColumn[],
    distantTableIdColumn: PostgresTableSchemaColumn,
    dataSourceMetadataId: string,
  ) {
    const localTableNameSingular = localTableSuffix
      ? `${localTableBaseName}${localTableSuffix}`
      : localTableBaseName;

    const localTableNamePlural = localTableSuffix
      ? `${plural(localTableBaseName)}${localTableSuffix}`
      : plural(localTableBaseName);

    const objectMetadata = await this.objectMetadataService.createOneObject({
      createObjectInput: {
        nameSingular: camelCase(localTableNameSingular),
        namePlural: camelCase(localTableNamePlural),
        labelSingular: camelToTitleCase(camelCase(localTableBaseName)),
        labelPlural: camelToTitleCase(plural(camelCase(localTableBaseName))),
        description: 'Remote table',
        dataSourceId: dataSourceMetadataId,
        icon: 'IconPlug',
        isRemote: true,
        primaryKeyColumnType: distantTableIdColumn.udtName,
        primaryKeyFieldMetadataSettings: mapUdtNameToFieldSettings(
          distantTableIdColumn.udtName,
        ),
      },
      workspaceId: workspaceId,
    });

    for (const column of distantTableColumns) {
      const columnName = camelCase(column.columnName);

      // TODO: return error to the user when a column cannot be managed
      try {
        const field = await this.createFieldMetadataForForeignTableColumn(
          workspaceId,
          columnName,
          column.udtName,
          objectMetadata.id,
        );

        if (columnName === 'id') {
          await this.objectMetadataService.updateOneObject({
            workspaceId,
            updateObjectInput: {
              id: objectMetadata.id,
              update: {
                labelIdentifierFieldMetadataId: field.id,
              },
            },
          });
        }
      } catch (error) {
        this.logger.error(
          `Could not create field ${columnName} for remote table ${localTableNameSingular}: ${error}`,
        );
      }
    }
  }

  private getDistantTablesWithPendingUpdates(
    schemaPendingUpdates: { [tablename: string]: DistantTableUpdate[] },
    distantTablesWithStatus: {
      name: string;
      schema: string;
      status: RemoteTableStatus;
    }[],
    remoteServerSchema: string,
  ) {
    const distantTablesWithUpdates = distantTablesWithStatus.map((table) => ({
      ...table,
      schemaPendingUpdates: schemaPendingUpdates[table.name] || [],
    }));

    const deletedTables = Object.entries(schemaPendingUpdates)
      .filter(([_tableName, updates]) =>
        updates.includes(DistantTableUpdate.TABLE_DELETED),
      )
      .map(([tableName, updates]) => ({
        name: tableName,
        schema: remoteServerSchema,
        status: RemoteTableStatus.SYNCED,
        schemaPendingUpdates: updates,
      }));

    return [...distantTablesWithUpdates, ...deletedTables];
  }

  private async updateForeignTableAndFieldsMetadata(
    foreignTableName: string,
    workspaceId: string,
    columnsUpdates: WorkspaceMigrationColumnAction[],
  ) {
    const updatedForeignTable =
      await this.foreignTableService.updateForeignTable(
        foreignTableName,
        workspaceId,
        columnsUpdates,
      );

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: foreignTableName },
      });

    if (!objectMetadata) {
      throw new RemoteTableException(
        `Cannot find associated object for table ${foreignTableName}`,
        RemoteTableExceptionCode.NO_OBJECT_METADATA_FOUND,
      );
    }
    for (const columnUpdate of columnsUpdates) {
      this.updateFieldMetadataFromColumnUpdate(
        columnUpdate,
        workspaceId,
        objectMetadata.id,
      );
    }

    return updatedForeignTable;
  }

  private async updateFieldMetadataFromColumnUpdate(
    columnUpdate: WorkspaceMigrationColumnAction,
    workspaceId: string,
    objectMetadataId: string,
  ) {
    if (columnUpdate.action === WorkspaceMigrationColumnActionType.CREATE) {
      await this.createFieldMetadataForForeignTableColumn(
        workspaceId,
        columnUpdate.columnName,
        columnUpdate.columnType,
        objectMetadataId,
      );
    }
    if (columnUpdate.action === WorkspaceMigrationColumnActionType.DROP) {
      const columnName = columnUpdate.columnName;

      const fieldMetadataToDelete =
        await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
          where: {
            objectMetadataId: objectMetadataId,
            name: columnName,
          },
        });

      if (!fieldMetadataToDelete) {
        throw new RemoteTableException(
          `Cannot find associated field metadata for column ${columnName}`,
          RemoteTableExceptionCode.NO_FIELD_METADATA_FOUND,
        );
      }

      await this.fieldMetadataService.deleteOneField({
        deleteOneFieldInput: { id: fieldMetadataToDelete.id },
        workspaceId,
      });
    }
  }

  private async createFieldMetadataForForeignTableColumn(
    workspaceId: string,
    columnName: string,
    columnType: string,
    objectMetadataId: string,
  ): Promise<FlatFieldMetadata> {
    return this.fieldMetadataService.createOneField({
      createFieldInput: {
        name: columnName,
        label: camelToTitleCase(columnName),
        description: 'Field of remote',
        type: mapUdtNameToFieldType(columnType),
        objectMetadataId: objectMetadataId,
        isRemoteCreation: true,
        isNullable: true,
        icon: 'IconPlug',
        settings: mapUdtNameToFieldSettings(columnType),
      },
      workspaceId: workspaceId,
    });
  }
}
