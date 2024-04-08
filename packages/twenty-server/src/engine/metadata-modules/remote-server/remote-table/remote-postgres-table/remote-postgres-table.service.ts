import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  buildPostgresUrl,
  EXCLUDED_POSTGRES_SCHEMAS,
} from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/utils/remote-postgres-table.util';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { RemoteTableColumn } from 'src/engine/metadata-modules/remote-server/remote-table/types/remote-table-column';
import { RemoteTable } from 'src/engine/metadata-modules/remote-server/remote-table/types/remote-table';

@Injectable()
export class RemotePostgresTableService {
  constructor(private readonly environmentService: EnvironmentService) {}

  public async fetchPostgresTableColumnsSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    tableName: string,
    tableSchema: string,
  ): Promise<RemoteTableColumn[]> {
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

    return columns.map(
      (column) =>
        ({
          columnName: column.column_name,
          dataType: column.data_type,
          udtName: column.udt_name,
        }) as RemoteTableColumn,
    );
  }

  public async fetchTablesFromRemotePostgresSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ): Promise<RemoteTable[]> {
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

    return remotePostgresTables.map(
      (table) =>
        ({
          tableName: table.table_name,
          tableSchema: table.table_schema,
        }) as RemoteTable,
    );
  }
}
