import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { plural } from 'pluralize';

import {
  RemoteServerType,
  RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  RemoteTableStatus,
  TableUpdate,
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
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  ReferencedTable,
  WorkspaceMigrationForeignColumnDefinition,
  WorkspaceMigrationForeignTable,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { getRemoteTableLocalName } from 'src/engine/metadata-modules/remote-server/remote-table/utils/get-remote-table-local-name.util';
import { DistantTableService } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service';
import { DistantTableColumn } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table-column';
import { DistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table';
import { RemoteTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/remote-table/types/remote-table-schema-column';

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
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async findDistantTablesByServerId(
    id: string,
    workspaceId: string,
    refreshData?: boolean,
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
      refreshData,
    );

    if (!refreshData || currentRemoteTables.length === 0) {
      const distantTablesWithStatus = Object.keys(distantTables).map(
        (tableName) => ({
          name: tableName,
          schema: remoteServer.schema,
          status: currentRemoteTableDistantNames.includes(tableName)
            ? RemoteTableStatus.SYNCED
            : RemoteTableStatus.NOT_SYNCED,
        }),
      );

      return distantTablesWithStatus;
    }

    const schemaPendingUpdates =
      await this.getSchemaUpdatesBetweenRemoteAndDistantTables({
        workspaceId,
        remoteTables: currentRemoteTables,
        distantTables,
      });

    const distantTablesWithUpdates = Object.keys(distantTables).map(
      (tableName) => ({
        name: tableName,
        schema: remoteServer.schema,
        status: currentRemoteTableDistantNames.includes(tableName)
          ? RemoteTableStatus.SYNCED
          : RemoteTableStatus.NOT_SYNCED,
        schemaPendingUpdates: schemaPendingUpdates[tableName],
      }),
    );

    const deletedTables = Object.entries(schemaPendingUpdates)
      .filter(([_tableName, updates]) =>
        updates.includes(TableUpdate.TABLE_DELETED),
      )
      .map(([tableName, updates]) => ({
        name: tableName,
        schema: remoteServer.schema,
        status: RemoteTableStatus.SYNCED,
        schemaPendingUpdates: updates,
      }));

    return distantTablesWithUpdates.concat(deletedTables);
  }

  private async getSchemaUpdatesBetweenRemoteAndDistantTables({
    workspaceId,
    remoteTables,
    distantTables,
  }: {
    workspaceId: string;
    remoteTables: RemoteTableEntity[];
    distantTables: DistantTables;
  }): Promise<{ [tablename: string]: TableUpdate[] }> {
    const updates = {};

    for (const remoteTable of remoteTables) {
      const distantTable = distantTables[remoteTable.distantTableName];
      const tableName = remoteTable.distantTableName;

      if (!distantTable) {
        updates[tableName] = [TableUpdate.TABLE_DELETED];
        continue;
      }

      const distantColumnNames = new Set(
        distantTable.map((column) => column.columnName),
      );
      const localColumnNames = new Set(
        (
          await this.fetchTableColumns(workspaceId, remoteTable.localTableName)
        ).map((column) => column.column_name),
      );

      const columnsAdded = [...distantColumnNames].filter(
        (columnName) => !localColumnNames.has(columnName),
      );

      const columnsDeleted = [...localColumnNames].filter(
        (columnName) => !distantColumnNames.has(columnName),
      );

      if (columnsAdded.length > 0) {
        updates[tableName] = [
          ...(updates[tableName] || []),
          TableUpdate.COLUMNS_ADDED,
        ];
      }
      if (columnsDeleted.length > 0) {
        updates[tableName] = [
          ...(updates[tableName] || []),
          TableUpdate.COLUMNS_DELETED,
        ];
      }
    }

    return updates;
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

    const localTableName = getRemoteTableLocalName(input.name);

    await this.validateTableNameDoesNotExists(
      localTableName,
      workspaceId,
      dataSourceMetatada.schema,
    );

    const remoteTableEntity = this.remoteTableRepository.create({
      distantTableName: input.name,
      localTableName,
      workspaceId,
      remoteServerId: remoteServer.id,
    });

    const distantTableColumns = this.distantTableService.getDistantTableColumns(
      remoteServer,
      input.name,
    );

    // We only support remote tables with an id column for now.
    const distantTableIdColumn = distantTableColumns.find(
      (column) => column.columnName === 'id',
    );

    if (!distantTableIdColumn) {
      throw new BadRequestException('Remote table must have an id column');
    }

    await this.createForeignTable(
      workspaceId,
      localTableName,
      input,
      remoteServer,
      distantTableColumns,
    );

    await this.createRemoteTableMetadata(
      workspaceId,
      localTableName,
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

  private async unsyncOne(
    workspaceId: string,
    remoteTable: RemoteTableEntity,
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ) {
    const currentForeignTableNames =
      await this.fetchForeignTableNamesWithinWorkspace(
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

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`drop-foreign-table-${remoteTable.localTableName}`),
      workspaceId,
      [
        {
          name: remoteTable.localTableName,
          action: WorkspaceMigrationTableActionType.DROP_FOREIGN_TABLE,
        },
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.remoteTableRepository.delete(remoteTable.id);

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);
  }

  private async validateTableNameDoesNotExists(
    tableName: string,
    workspaceId: string,
    workspaceSchemaName: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const numberOfTablesWithSameName = +(
      await workspaceDataSource.query(
        `SELECT count(table_name) FROM information_schema.tables WHERE table_name LIKE '${tableName}' AND table_schema IN ('core', 'metadata', '${workspaceSchemaName}')`,
      )
    )[0].count;

    if (numberOfTablesWithSameName > 0) {
      throw new BadRequestException('Table name is not available.');
    }
  }

  private async fetchForeignTableNamesWithinWorkspace(
    workspaceId: string,
    foreignDataWrapperId: string,
  ): Promise<string[]> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    return (
      await workspaceDataSource.query(
        `SELECT foreign_table_name, foreign_server_name FROM information_schema.foreign_tables WHERE foreign_server_name = '${foreignDataWrapperId}'`,
      )
    ).map((foreignTable) => foreignTable.foreign_table_name);
  }

  private async fetchTableColumns(
    workspaceId: string,
    tableName: string,
  ): Promise<RemoteTableSchemaColumn[]> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await workspaceDataSource.query(
      `SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = '${schemaName}' AND table_name = '${tableName}'`,
    );
  }

  private async createForeignTable(
    workspaceId: string,
    localTableName: string,
    remoteTableInput: RemoteTableInput,
    remoteServer: RemoteServerEntity<RemoteServerType>,
    distantTableColumns: DistantTableColumn[],
  ) {
    const referencedTable: ReferencedTable = this.buildReferencedTable(
      remoteServer,
      remoteTableInput,
    );

    const workspaceMigration =
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`create-foreign-table-${localTableName}`),
        workspaceId,
        [
          {
            name: localTableName,
            action: WorkspaceMigrationTableActionType.CREATE_FOREIGN_TABLE,
            foreignTable: {
              columns: distantTableColumns.map(
                (column) =>
                  ({
                    columnName: camelCase(column.columnName),
                    columnType: column.dataType,
                    distantColumnName: column.columnName,
                  }) satisfies WorkspaceMigrationForeignColumnDefinition,
              ),
              referencedTable,
              foreignDataWrapperId: remoteServer.foreignDataWrapperId,
            } satisfies WorkspaceMigrationForeignTable,
          },
        ],
      );

    // TODO: This should be done in a transaction. Waiting for a global refactoring of transaction management.
    try {
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );
    } catch (exception) {
      this.workspaceMigrationService.deleteById(workspaceMigration.id);

      throw new BadRequestException(
        'Could not create foreign table. The table may already exists or a column type may not be supported.',
      );
    }
  }

  private async createRemoteTableMetadata(
    workspaceId: string,
    localTableName: string,
    distantTableColumns: DistantTableColumn[],
    distantTableIdColumn: DistantTableColumn,
    dataSourceMetadataId: string,
  ) {
    const objectMetadata = await this.objectMetadataService.createOne({
      nameSingular: localTableName,
      namePlural: plural(localTableName),
      labelSingular: camelToTitleCase(camelCase(localTableName)),
      labelPlural: camelToTitleCase(plural(camelCase(localTableName))),
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
          `Could not create field ${columnName} for remote table ${localTableName}: ${error}`,
        );
      }
    }
  }

  private buildReferencedTable(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    remoteTableInput: RemoteTableInput,
  ): ReferencedTable {
    switch (remoteServer.foreignDataWrapperType) {
      case RemoteServerType.POSTGRES_FDW:
        return {
          table_name: remoteTableInput.name,
          schema_name: remoteServer.schema,
        };
      case RemoteServerType.STRIPE_FDW:
        return { object: remoteTableInput.name };
      default:
        throw new BadRequestException('Foreign data wrapper not supported');
    }
  }
}
