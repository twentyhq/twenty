import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { DistantTableColumn } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table-column';
import { DistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table';
import { STRIPE_DISTANT_TABLES } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/util/stripe-distant-tables.util';

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
      throw new BadRequestException(
        'Remote server available tables are not defined',
      );
    }

    return remoteServer.availableTables[tableName];
  }

  public async fetchDistantTableNames(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ): Promise<string[]> {
    const availableTables =
      remoteServer.availableTables ??
      (await this.createAvailableTables(remoteServer, workspaceId));

    return Object.keys(availableTables);
  }

  private async createAvailableTables(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ): Promise<DistantTables> {
    if (remoteServer.schema) {
      return this.createAvailableTablesFromDynamicSchema(
        remoteServer,
        workspaceId,
      );
    }

    return this.createAvailableTablesFromStaticSchema(remoteServer);
  }

  private async createAvailableTablesFromDynamicSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
  ): Promise<DistantTables> {
    if (!remoteServer.schema) {
      throw new BadRequestException('Remote server schema is not defined');
    }

    const tmpSchemaId = v4();
    const tmpSchemaName = `${workspaceId}_${remoteServer.id}_${tmpSchemaId}`;

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const availableTables = await workspaceDataSource.transaction(
      async (entityManager: EntityManager) => {
        await entityManager.query(`CREATE SCHEMA "${tmpSchemaName}"`);

        await entityManager.query(
          `IMPORT FOREIGN SCHEMA "${remoteServer.schema}" FROM SERVER "${remoteServer.foreignDataWrapperId}" INTO "${tmpSchemaName}"`,
        );

        const createdForeignTableNames = await entityManager.query(
          `SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = '${tmpSchemaName}'`,
        );

        await entityManager.query(`DROP SCHEMA "${tmpSchemaName}" CASCADE`);

        return createdForeignTableNames.reduce(
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
      },
    );

    await this.remoteServerRepository.update(remoteServer.id, {
      availableTables,
    });

    return availableTables;
  }

  private async createAvailableTablesFromStaticSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ): Promise<DistantTables> {
    switch (remoteServer.foreignDataWrapperType) {
      case RemoteServerType.STRIPE_FDW:
        this.remoteServerRepository.update(remoteServer.id, {
          availableTables: STRIPE_DISTANT_TABLES,
        });

        return STRIPE_DISTANT_TABLES;
      default:
        throw new BadRequestException(
          `Type ${remoteServer.foreignDataWrapperType} does not have a static schema.`,
        );
    }
  }
}
