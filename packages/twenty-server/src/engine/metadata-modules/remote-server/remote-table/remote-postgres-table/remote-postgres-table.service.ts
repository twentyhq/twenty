import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import {
  buildPostgresUrl,
  EXCLUDED_POSTGRES_SCHEMAS,
} from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/utils/remote-postgres-table.util';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class RemotePostgresTableService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async findAvailableRemotePostgresTables(
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

  public async fetchPostgresTableColumnsSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    tableName: string,
    tableSchema: string,
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

    const columns = await dataSource.query(
      `SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = '${tableName}' AND table_schema = '${tableSchema}'`,
    );

    await dataSource.destroy();

    return columns;
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
