import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { plural } from 'pluralize';

import {
  RemoteServerType,
  RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import {
  isPostgreSQLIntegrationEnabled,
  mapUdtNameToFieldType,
  mapUdtNameToSettings,
} from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/utils/remote-postgres-table.util';
import { RemoteTableInput } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table-input';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { RemotePostgresTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/remote-postgres-table.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { camelCase } from 'src/utils/camel-case';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnDefinition,
  WorkspaceMigrationForeignTable,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { RemoteTableColumn } from 'src/engine/metadata-modules/remote-server/remote-table/types/remote-table-column';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { RemoteTable } from 'src/engine/metadata-modules/remote-server/remote-table/types/remote-table';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { getRemoteTableLocalName } from 'src/engine/metadata-modules/remote-server/remote-table/utils/get-remote-table-local-name.util';

export class RemoteTableService {
  constructor(
    @InjectRepository(RemoteTableEntity, 'metadata')
    private readonly remoteTableRepository: Repository<RemoteTableEntity>,
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly dataSourceService: DataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly remotePostgresTableService: RemotePostgresTableService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async findAvailableRemoteTablesByServerId(
    id: string,
    workspaceId: string,
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

    const currentRemoteTableDistantNames = (
      await this.remoteTableRepository.find({
        where: {
          remoteServerId: id,
          workspaceId,
        },
      })
    ).map((remoteTable) => remoteTable.distantTableName);

    const tablesInRemoteSchema =
      await this.fetchTablesFromRemoteSchema(remoteServer);

    return tablesInRemoteSchema.map((remoteTable) => ({
      name: remoteTable.tableName,
      schema: remoteTable.tableSchema,
      status: currentRemoteTableDistantNames.includes(remoteTable.tableName)
        ? RemoteTableStatus.SYNCED
        : RemoteTableStatus.NOT_SYNCED,
    }));
  }

  public async syncRemoteTable(input: RemoteTableInput, workspaceId: string) {
    if (!input.schema) {
      throw new BadRequestException(
        'Schema is required for syncing remote table',
      );
    }

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

    const remoteTableColumns = await this.fetchTableColumnsSchema(
      remoteServer,
      input.name,
      input.schema,
    );

    // We only support remote tables with an id column for now.
    const remoteTableIdColumn = remoteTableColumns.find(
      (column) => column.columnName === 'id',
    );

    if (!remoteTableIdColumn) {
      throw new BadRequestException('Remote table must have an id column');
    }

    await this.createForeignTable(
      workspaceId,
      localTableName,
      input,
      remoteServer,
      remoteTableColumns,
    );

    await this.createRemoteTableMetadata(
      workspaceId,
      localTableName,
      remoteTableColumns,
      remoteTableIdColumn,
      dataSourceMetatada.id,
    );

    await this.remoteTableRepository.save(remoteTableEntity);

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

    return {
      id: remoteTableEntity.id,
      name: input.name,
      schema: input.schema,
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
      schema: input.schema,
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

  private async fetchTableColumnsSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    tableName: string,
    tableSchema: string,
  ): Promise<RemoteTableColumn[]> {
    switch (remoteServer.foreignDataWrapperType) {
      case RemoteServerType.POSTGRES_FDW:
        await isPostgreSQLIntegrationEnabled(
          this.featureFlagRepository,
          remoteServer.workspaceId,
        );

        return this.remotePostgresTableService.fetchPostgresTableColumnsSchema(
          remoteServer,
          tableName,
          tableSchema,
        );
      default:
        throw new BadRequestException('Unsupported foreign data wrapper type');
    }
  }

  private async fetchTablesFromRemoteSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ): Promise<RemoteTable[]> {
    switch (remoteServer.foreignDataWrapperType) {
      case RemoteServerType.POSTGRES_FDW:
        await isPostgreSQLIntegrationEnabled(
          this.featureFlagRepository,
          remoteServer.workspaceId,
        );

        return this.remotePostgresTableService.fetchTablesFromRemotePostgresSchema(
          remoteServer,
        );
      default:
        throw new BadRequestException('Unsupported foreign data wrapper type');
    }
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

  private async createForeignTable(
    workspaceId: string,
    localTableName: string,
    remoteTableInput: RemoteTableInput,
    remoteServer: RemoteServerEntity<RemoteServerType>,
    remoteTableColumns: RemoteTableColumn[],
  ) {
    if (!remoteTableInput.schema) {
      throw new BadRequestException(
        'Schema is required for creating foreign table',
      );
    }

    const workspaceMigration =
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`create-foreign-table-${localTableName}`),
        workspaceId,
        [
          {
            name: localTableName,
            action: WorkspaceMigrationTableActionType.CREATE_FOREIGN_TABLE,
            foreignTable: {
              columns: remoteTableColumns.map(
                (column) =>
                  ({
                    columnName: column.columnName,
                    columnType: column.dataType,
                  }) satisfies WorkspaceMigrationColumnDefinition,
              ),
              referencedTableName: remoteTableInput.name,
              referencedTableSchema: remoteTableInput.schema,
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
    remoteTableColumns: RemoteTableColumn[],
    remoteTableIdColumn: RemoteTableColumn,
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
      primaryKeyColumnType: remoteTableIdColumn.udtName,
      // TODO: function should work for other types than Postgres
      primaryKeyFieldMetadataSettings: mapUdtNameToSettings(
        remoteTableIdColumn.udtName,
      ),
    } satisfies CreateObjectInput);

    for (const column of remoteTableColumns) {
      const field = await this.fieldMetadataService.createOne({
        name: column.columnName,
        label: camelToTitleCase(camelCase(column.columnName)),
        description: 'Field of remote',
        // TODO: function should work for other types than Postgres
        type: mapUdtNameToFieldType(column.udtName),
        workspaceId: workspaceId,
        objectMetadataId: objectMetadata.id,
        isRemoteCreation: true,
        isNullable: true,
        icon: 'IconPlug',
        // TODO: function should work for other types than Postgres
        settings: mapUdtNameToSettings(column.udtName),
      } satisfies CreateFieldInput);

      if (column.columnName === 'id') {
        await this.objectMetadataService.updateOne(objectMetadata.id, {
          labelIdentifierFieldMetadataId: field.id,
        });
      }
    }
  }
}
