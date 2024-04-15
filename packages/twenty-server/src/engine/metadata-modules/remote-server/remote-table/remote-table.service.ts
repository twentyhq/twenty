import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  RemoteServerType,
  RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  RemoteTableDTO,
  RemoteTableStatus,
} from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import {
  isPostgreSQLIntegrationEnabled,
  mapUdtNameToFieldType,
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
import { getRemoteTableLocalName } from 'src/engine/metadata-modules/remote-server/remote-table/utils/get-remote-table-local-name.util';
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

export class RemoteTableService {
  constructor(
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

    const currentForeignTableNames =
      await this.fetchForeignTableNamesWithinWorkspace(
        workspaceId,
        remoteServer.foreignDataWrapperId,
      );

    const tableInRemoteSchema =
      await this.fetchTablesFromRemoteSchema(remoteServer);

    return tableInRemoteSchema.map((remoteTable) => ({
      name: remoteTable.tableName,
      schema: remoteTable.tableSchema,
      status: currentForeignTableNames.includes(
        getRemoteTableLocalName(remoteTable.tableName),
      )
        ? RemoteTableStatus.SYNCED
        : RemoteTableStatus.NOT_SYNCED,
    }));
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

    const remoteTable = await this.createForeignTableAndMetadata(
      input,
      remoteServer,
      workspaceId,
    );

    return remoteTable;
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

    const remoteTableLocalName = getRemoteTableLocalName(input.name);

    await this.removeForeignTableAndMetadata(
      remoteTableLocalName,
      workspaceId,
      remoteServer,
    );

    return {
      name: input.name,
      schema: input.schema,
      status: RemoteTableStatus.NOT_SYNCED,
    };
  }

  public async fetchForeignTableNamesWithinWorkspace(
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

  public async removeForeignTableAndMetadata(
    remoteTableLocalName: string,
    workspaceId: string,
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ) {
    const currentForeignTableNames =
      await this.fetchForeignTableNamesWithinWorkspace(
        workspaceId,
        remoteServer.foreignDataWrapperId,
      );

    if (!currentForeignTableNames.includes(remoteTableLocalName)) {
      throw new Error('Remote table does not exist');
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: remoteTableLocalName },
      });

    if (objectMetadata) {
      await this.objectMetadataService.deleteOneObject(
        { id: objectMetadata.id },
        workspaceId,
      );
    }

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`drop-foreign-table-${remoteTableLocalName}`),
      workspaceId,
      [
        {
          name: remoteTableLocalName,
          action: WorkspaceMigrationTableActionType.DROP_FOREIGN_TABLE,
        },
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);
  }

  private async createForeignTableAndMetadata(
    input: RemoteTableInput,
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ): Promise<RemoteTableDTO> {
    if (!input.schema) {
      throw new Error('Schema is required for syncing remote table');
    }

    const currentForeignTableNames =
      await this.fetchForeignTableNamesWithinWorkspace(
        workspaceId,
        remoteServer.foreignDataWrapperId,
      );

    if (
      currentForeignTableNames.includes(getRemoteTableLocalName(input.name))
    ) {
      throw new Error('Remote table already exists');
    }

    const remoteTableColumns = await this.fetchTableColumnsSchema(
      remoteServer,
      input.name,
      input.schema,
    );

    const remoteTableLocalName = getRemoteTableLocalName(input.name);
    const remoteTableLabel = camelToTitleCase(remoteTableLocalName);

    // We only support remote tables with an id column for now.
    const remoteTableIdColumn = remoteTableColumns.filter(
      (column) => column.columnName === 'id',
    )?.[0];

    if (!remoteTableIdColumn) {
      throw new Error('Remote table must have an id column');
    }

    const dataSourceMetatada =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-foreign-table-${remoteTableLocalName}`),
      workspaceId,
      [
        {
          name: remoteTableLocalName,
          action: WorkspaceMigrationTableActionType.CREATE_FOREIGN_TABLE,
          foreignTable: {
            columns: remoteTableColumns.map(
              (column) =>
                ({
                  columnName: column.columnName,
                  columnType: column.dataType,
                }) satisfies WorkspaceMigrationColumnDefinition,
            ),
            referencedTableName: input.name,
            referencedTableSchema: input.schema,
            foreignDataWrapperId: remoteServer.foreignDataWrapperId,
          } satisfies WorkspaceMigrationForeignTable,
        },
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    const objectMetadata = await this.objectMetadataService.createOne({
      nameSingular: remoteTableLocalName,
      namePlural: `${remoteTableLocalName}s`,
      labelSingular: remoteTableLabel,
      labelPlural: `${remoteTableLabel}s`,
      description: 'Remote table',
      dataSourceId: dataSourceMetatada.id,
      workspaceId: workspaceId,
      icon: 'IconPlug',
      isRemote: true,
      remoteTablePrimaryKeyColumnType: remoteTableIdColumn.udtName,
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
      } satisfies CreateFieldInput);

      if (column.columnName === 'id') {
        await this.objectMetadataService.updateOne(objectMetadata.id, {
          labelIdentifierFieldMetadataId: field.id,
        });
      }
    }

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

    return {
      name: input.name,
      schema: input.schema,
      status: RemoteTableStatus.SYNCED,
    };
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
        throw new Error('Unsupported foreign data wrapper type');
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
        throw new Error('Unsupported foreign data wrapper type');
    }
  }
}
