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
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDefinition,
  WorkspaceMigrationCreateComment,
  WorkspaceMigrationForeignTable,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { RemoteTableColumn } from 'src/engine/metadata-modules/remote-server/remote-table/types/remote-table-column';

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

    switch (remoteServer.foreignDataWrapperType) {
      case RemoteServerType.POSTGRES_FDW:
        await isPostgreSQLIntegrationEnabled(
          this.featureFlagRepository,
          workspaceId,
        );

        return this.remotePostgresTableService.findAvailableRemotePostgresTables(
          workspaceId,
          remoteServer,
        );
      default:
        throw new Error('Unsupported foreign data wrapper type');
    }
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
        await this.buildForeignTableAndMetadata(
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

  private async buildForeignTableAndMetadata(
    input: RemoteTableInput,
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ) {
    const remoteTableColumns = await this.fetchTableColumnsSchema(
      remoteServer,
      input.name,
      input.schema,
    );

    const remoteTableName = `${camelCase(input.name)}Remote`;
    const remoteTableLabel = camelToTitleCase(remoteTableName);

    // We only support remote tables with an id column for now.
    const remoteTableIdColumn = remoteTableColumns.filter(
      (column) => column.columnName === 'id',
    )?.[0];

    if (!remoteTableIdColumn) {
      throw new Error('Remote table must have an id column');
    }

    const dataSourcesMetatada =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        workspaceId,
      );

    if (!dataSourcesMetatada) {
      throw new NotFoundException('Workspace data source does not exist');
    }

    this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-remote-table-${remoteTableName}`),
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
        {
          name: remoteTableName,
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
              comment: `@graphql({"primary_key_columns": ["id"], "totalCount": {"enabled": true}})`,
              isForeignTable: true,
            } satisfies WorkspaceMigrationCreateComment,
          ],
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
      dataSourceId: dataSourcesMetatada[0].id,
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
    const remoteTableName = `${camelCase(input.name)}Remote`;

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

    this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`drop-remote-table-${input.name}`),
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
}
