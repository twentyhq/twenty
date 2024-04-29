import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { DistantTableColumn } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table-column';
import { DistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table';

@Injectable()
export class DistantTableService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
  ) {}

  public async fetchDistantTableColumns(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    tableName: string,
  ): Promise<DistantTableColumn[]> {
    if (!remoteServer.availableTables) {
      throw new Error('Remote server available tables are not defined');
    }

    return remoteServer.availableTables[tableName];
  }

  public async fetchDistantTableNames(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ): Promise<string[]> {
    if (!remoteServer.schema) {
      throw new Error('Remote server schema is not defined');
    }

    const availableTables =
      remoteServer.availableTables ??
      (await this.createAvailableTables(remoteServer, workspaceId));

    return Object.keys(availableTables);
  }

  private async createAvailableTables(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ): Promise<DistantTables> {
    const tmpSchemaId = v4();
    const tmpSchemaName = `${workspaceId}_${remoteServer.id}_${tmpSchemaId}`;

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource.query(`CREATE SCHEMA "${tmpSchemaName}"`);

    await workspaceDataSource.query(
      `IMPORT FOREIGN SCHEMA "${remoteServer.schema}" FROM SERVER "${remoteServer.foreignDataWrapperId}" INTO "${tmpSchemaName}"`,
    );

    const createdForeignTableNames = await workspaceDataSource.query(
      `SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = '${tmpSchemaName}'`,
    );

    const availableTables: DistantTables = createdForeignTableNames.reduce(
      (acc, { table_name, column_name, data_type, udt_name }) => {
        if (!acc[table_name]) {
          acc[table_name] = [];
        }

        acc[table_name].push({
          columnName: column_name,
          dataType: data_type,
          udtName: udt_name,
        });

        return acc;
      },
      {},
    );

    await workspaceDataSource.query(`DROP SCHEMA "${tmpSchemaName}" CASCADE`);

    await this.remoteServerRepository.update(remoteServer.id, {
      availableTables,
    });

    return availableTables;
  }
}
