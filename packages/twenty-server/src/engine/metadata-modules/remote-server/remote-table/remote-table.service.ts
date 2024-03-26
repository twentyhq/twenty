import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import {
  RemoteServerType,
  RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  EXCLUDED_POSTGRES_SCHEMAS,
  buildPostgresUrl,
} from 'src/engine/metadata-modules/remote-server/remote-table/utils/remote-table-postgres.util';

export class RemoteTableService {
  constructor(
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly environmentService: EnvironmentService,
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
        return this.findAvailableRemotePostgresTables(
          workspaceId,
          remoteServer,
        );
      default:
        throw new Error('Unsupported foreign data wrapper type');
    }
  }

  // TODO: may be moved into a separated postgres table service once we have more use cases
  private async findAvailableRemotePostgresTables(
    workspaceId: string,
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ) {
    const remotePostgresTables =
      await this.fetchTablesFromRemotePostgresSchema(remoteServer);

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const currentForeignTableNames = (
      await workspaceDataSource.query(
        `SELECT foreign_table_name FROM information_schema.foreign_tables`,
      )
    ).map((foreignTable) => foreignTable.foreign_table_name);

    return remotePostgresTables.map((remoteTable) => ({
      name: remoteTable.table_name,
      schema: remoteTable.table_schema,
      status: currentForeignTableNames.includes(remoteTable.table_name)
        ? RemoteTableStatus.SYNCED
        : RemoteTableStatus.NOT_SYNCED,
    }));
  }

  private async fetchTablesFromRemotePostgresSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ) {
    const dataSource = new DataSource({
      url: buildPostgresUrl(
        this.environmentService.get('LOGIN_TOKEN_SECRET'),
        remoteServer,
      ),
      type: 'postgres',
      logging: true,
    });

    await dataSource.initialize();

    const schemaNames = await dataSource.query(
      `SELECT schema_name FROM information_schema.schemata where schema_name not in ( ${EXCLUDED_POSTGRES_SCHEMAS.map(
        (schema) => `'${schema}'`,
      ).join(', ')} ) order by schema_name limit 1`,
    );

    const remotePostgresTables = await dataSource.query(
      `SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema IN (${schemaNames
        .map((schemaName) => `'${schemaName.schema_name}'`)
        .join(', ')})`,
    );

    await dataSource.destroy();

    return remotePostgresTables;
  }
}
