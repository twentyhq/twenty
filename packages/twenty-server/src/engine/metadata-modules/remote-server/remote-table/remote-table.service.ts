import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { plural } from 'pluralize';
import isEmpty from 'lodash.isempty';

import {
  RemoteServerType,
  RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  DistantTableUpdate,
  RemoteTableStatus,
} from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import {
  mapUdtNameToFieldType,
  mapUdtNameToFieldSettings,
} from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { RemoteTableInput } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table-input';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { camelCase } from 'src/utils/camel-case';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { getRemoteTableLocalName } from 'src/engine/metadata-modules/remote-server/remote-table/utils/get-remote-table-local-name.util';
import { DistantTableService } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service';
import { PostgresTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/types/postgres-table-schema-column';
import { fetchTableColumns } from 'src/engine/metadata-modules/remote-server/remote-table/utils/fetch-table-columns.util';
import { ForeignTableService } from 'src/engine/metadata-modules/remote-server/remote-table/foreign-table/foreign-table.service';
import { RemoteTableSchemaUpdateService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service';
import { sortDistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/utils/sort-distant-tables.util';

export class RemoteTableService {
  private readonly logger = new Logger(RemoteTableService.name);

  constructor(
    @InjectRepository(RemoteTableEntity, 'metadata')
    private readonly remoteTableRepository: Repository<RemoteTableEntity>,
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly dataSourceService: DataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly distantTableService: DistantTableService,
    private readonly foreignTableService: ForeignTableService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly remoteTableSchemaUpdateService: RemoteTableSchemaUpdateService,
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
      throw new NotFoundException('Remote server does not exist');
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
      throw new NotFoundException('Remote server does not exist');
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
      throw new BadRequestException('Remote table already exists');
    }

    const dataSourceMetatada =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const { baseName: localTableBaseName, suffix: localTableSuffix } =
      await getRemoteTableLocalName(
        input.name,
        dataSourceMetatada.schema,
        workspaceDataSource,
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
      throw new BadRequestException('Table not found');
    }

    // We only support remote tables with an id column for now.
    const distantTableIdColumn = distantTableColumns.find(
      (column) => column.columnName === 'id',
    );

    if (!distantTableIdColumn) {
      throw new BadRequestException('Remote table must have an id column');
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

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

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
      throw new NotFoundException('Remote server does not exist');
    }

    const remoteTable = await this.remoteTableRepository.findOne({
      where: {
        distantTableName: input.name,
        remoteServerId: remoteServer.id,
        workspaceId,
      },
    });

    if (!remoteTable) {
      throw new NotFoundException('Remote table does not exist');
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
      throw new NotFoundException('Remote server does not exist');
    }

    const remoteTable = await this.remoteTableRepository.findOne({
      where: {
        distantTableName: input.name,
        remoteServerId: remoteServer.id,
        workspaceId,
      },
    });

    if (!remoteTable) {
      throw new NotFoundException('Remote table does not exist');
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

    const updatedTable = await this.foreignTableService.updateForeignTable(
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
      throw new NotFoundException('Foreign table does not exist');
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: remoteTable.localTableName },
      });

    if (objectMetadata) {
      await this.objectMetadataService.deleteOneObject(
        { id: objectMetadata.id },
        workspaceId,
      );
    }

    await this.foreignTableService.deleteForeignTable(
      remoteTable.localTableName,
      workspaceId,
    );

    await this.remoteTableRepository.delete(remoteTable.id);

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);
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

    const objectMetadata = await this.objectMetadataService.createOne({
      nameSingular: localTableNameSingular,
      namePlural: localTableNamePlural,
      labelSingular: camelToTitleCase(camelCase(localTableBaseName)),
      labelPlural: camelToTitleCase(plural(camelCase(localTableBaseName))),
      description: 'Remote table',
      dataSourceId: dataSourceMetadataId,
      workspaceId: workspaceId,
      icon: 'IconPlug',
      isRemote: true,
      primaryKeyColumnType: distantTableIdColumn.udtName,
      primaryKeyFieldMetadataSettings: mapUdtNameToFieldSettings(
        distantTableIdColumn.udtName,
      ),
    } satisfies CreateObjectInput);

    for (const column of distantTableColumns) {
      const columnName = camelCase(column.columnName);

      // TODO: return error to the user when a column cannot be managed
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

        if (columnName === 'id') {
          await this.objectMetadataService.updateOne(objectMetadata.id, {
            labelIdentifierFieldMetadataId: field.id,
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
}
