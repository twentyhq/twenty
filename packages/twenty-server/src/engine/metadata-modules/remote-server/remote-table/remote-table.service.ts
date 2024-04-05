import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import {
  RemoteServerType,
  RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
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
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { RemotePostgresTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/remote-postgres-table.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { camelCase } from 'src/utils/camel-case';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

export class RemoteTableService {
  constructor(
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly dataSourceService: DataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly remotePostgresTableService: RemotePostgresTableService,
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

    const dataSourcesMetatada =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        workspaceId,
      );

    if (!dataSourcesMetatada) {
      throw new NotFoundException('Workspace data source does not exist');
    }

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    switch (input.status) {
      case RemoteTableStatus.SYNCED:
        await this.buildForeignTableAndMetadata(
          input,
          remoteServer,
          workspaceId,
          workspaceDataSource,
          dataSourcesMetatada[0],
        );
        break;
      case RemoteTableStatus.NOT_SYNCED:
        await this.removeForeignTableAndMetadata(
          input,
          workspaceId,
          workspaceDataSource,
          dataSourcesMetatada[0].schema,
        );
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
    workspaceDataSource: DataSource,
    dataSourceMetadata: DataSourceEntity,
  ) {
    const localSchema = dataSourceMetadata.schema;

    // TODO: Add strong typing for remote table columns. Will be done when we have another use case than Postgres
    const remoteTableColumns = await this.fetchTableColumnsSchema(
      remoteServer,
      input.name,
      input.schema,
    );

    const foreignTableColumns = remoteTableColumns
      .map((column) => `"${column.column_name}" ${column.data_type}`)
      .join(', ');

    const remoteTableName = `${camelCase(input.name)}Remote`;
    const remoteTableLabel = camelToTitleCase(remoteTableName);

    // We only support remote tables with an id column for now.
    const remoteTableIdColumn = remoteTableColumns.filter(
      (column) => column.column_name === 'id',
    )?.[0];

    if (!remoteTableIdColumn) {
      throw new Error('Remote table must have an id column');
    }

    await workspaceDataSource.query(
      `CREATE FOREIGN TABLE ${localSchema}."${remoteTableName}" (${foreignTableColumns}) SERVER "${remoteServer.foreignDataWrapperId}" OPTIONS (schema_name '${input.schema}', table_name '${input.name}')`,
    );

    await workspaceDataSource.query(
      `COMMENT ON FOREIGN TABLE ${localSchema}."${remoteTableName}" IS e'@graphql({"primary_key_columns": ["id"], "totalCount": {"enabled": true}})'`,
    );

    // Should be done in a transaction. To be discussed
    const objectMetadata = await this.objectMetadataService.createOne({
      nameSingular: remoteTableName,
      namePlural: `${remoteTableName}s`,
      labelSingular: remoteTableLabel,
      labelPlural: `${remoteTableLabel}s`,
      description: 'Remote table',
      dataSourceId: dataSourceMetadata.id,
      workspaceId: workspaceId,
      icon: 'IconUser',
      isRemote: true,
      remoteTablePrimaryKeyColumnType: remoteTableIdColumn.udt_name,
    } as CreateObjectInput);

    for (const column of remoteTableColumns) {
      const field = await this.fieldMetadataService.createOne({
        name: column.column_name,
        label: camelToTitleCase(camelCase(column.column_name)),
        description: 'Field of remote',
        // TODO: function should work for other types than Postgres
        type: mapUdtNameToFieldType(column.udt_name),
        workspaceId: workspaceId,
        objectMetadataId: objectMetadata.id,
        isRemoteCreation: true,
        isNullable: true,
        icon: 'IconUser',
      } as CreateFieldInput);

      if (column.column_name === 'id') {
        await this.objectMetadataService.updateOne(objectMetadata.id, {
          labelIdentifierFieldMetadataId: field.id,
        });
      }
    }
  }

  private async removeForeignTableAndMetadata(
    input: RemoteTableInput,
    workspaceId: string,
    workspaceDataSource: DataSource,
    localSchema: string,
  ) {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: `${input.name}Remote` },
      });

    if (objectMetadata) {
      await this.objectMetadataService.deleteOneObject(
        { id: objectMetadata.id },
        workspaceId,
      );
    }

    await workspaceDataSource.query(
      `DROP FOREIGN TABLE ${localSchema}."${input.name}Remote"`,
    );
  }

  private async fetchTableColumnsSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    tableName: string,
    tableSchema: string,
  ) {
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
