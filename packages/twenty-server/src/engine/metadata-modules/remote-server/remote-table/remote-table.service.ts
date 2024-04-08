import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  RemoteServerType,
  RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
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
import { getRemoteTableName } from 'src/engine/metadata-modules/remote-server/remote-table/utils/get-remote-table-name.util';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnDefinition,
  WorkspaceMigrationForeignTable,
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
      await this.fetchForeignTableNamesWithinWorkspace(workspaceId);

    const tableInRemoteSchema =
      await this.fetchTablesFromRemoteSchema(remoteServer);

    return tableInRemoteSchema.map((remoteTable) => ({
      name: remoteTable.tableName,
      schema: remoteTable.tableSchema,
      status: currentForeignTableNames.includes(
        getRemoteTableName(remoteTable.tableName),
      )
        ? RemoteTableStatus.SYNCED
        : RemoteTableStatus.NOT_SYNCED,
    }));
  }

  public async updateRemoteTableSyncStatus(
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

    switch (input.status) {
      case RemoteTableStatus.SYNCED:
        await this.createForeignTableAndMetadata(
          input,
          remoteServer,
          workspaceId,
        );
        break;
      case RemoteTableStatus.NOT_SYNCED:
        await this.removeForeignTableAndMetadata(input, workspaceId);
        break;
      default:
        throw new Error('Unsupported remote table status');
    }

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

    return input;
  }

  private async createForeignTableAndMetadata(
    input: RemoteTableInput,
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ) {
    if (!input.schema) {
      throw new Error('Schema is required for syncing remote table');
    }

    const currentForeignTableNames =
      await this.fetchForeignTableNamesWithinWorkspace(workspaceId);

    if (currentForeignTableNames.includes(getRemoteTableName(input.name))) {
      throw new Error('Remote table already exists');
    }

    const remoteTableColumns = await this.fetchTableColumnsSchema(
      remoteServer,
      input.name,
      input.schema,
    );

    const remoteTableName = getRemoteTableName(input.name);
    const remoteTableLabel = camelToTitleCase(remoteTableName);

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
      generateMigrationName(`create-foreign-table-${remoteTableName}`),
      workspaceId,
      [
        {
          name: remoteTableName,
          action: 'create_foreign_table',
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
      nameSingular: remoteTableName,
      namePlural: `${remoteTableName}s`,
      labelSingular: remoteTableLabel,
      labelPlural: `${remoteTableLabel}s`,
      description: 'Remote table',
      dataSourceId: dataSourceMetatada.id,
      workspaceId: workspaceId,
      icon: 'IconUser',
      isRemote: true,
      remoteTablePrimaryKeyColumnType: remoteTableIdColumn.udtName,
    } as CreateObjectInput);

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
        icon: 'IconUser',
      } as CreateFieldInput);

      if (column.columnName === 'id') {
        await this.objectMetadataService.updateOne(objectMetadata.id, {
          labelIdentifierFieldMetadataId: field.id,
        });
      }
    }
  }

  private async removeForeignTableAndMetadata(
    input: RemoteTableInput,
    workspaceId: string,
  ) {
    const remoteTableName = getRemoteTableName(input.name);

    const currentForeignTableNames =
      await this.fetchForeignTableNamesWithinWorkspace(workspaceId);

    if (!currentForeignTableNames.includes(remoteTableName)) {
      throw new Error('Remote table does not exist');
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: remoteTableName },
      });

    if (objectMetadata) {
      await this.objectMetadataService.deleteOneObject(
        { id: objectMetadata.id },
        workspaceId,
      );
    }

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`drop-foreign-table-${input.name}`),
      workspaceId,
      [
        {
          name: remoteTableName,
          action: 'drop_foreign_table',
        },
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );
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

  private async fetchForeignTableNamesWithinWorkspace(workspaceId: string) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    return (
      await workspaceDataSource.query(
        `SELECT foreign_table_name FROM information_schema.foreign_tables`,
      )
    ).map((foreignTable) => foreignTable.foreign_table_name);
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
