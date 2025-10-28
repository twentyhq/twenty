import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, type EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import {
  type RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  DistantTableException,
  DistantTableExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.exception';
import { type DistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table';
import { STRIPE_DISTANT_TABLES } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/utils/stripe-distant-tables.util';
import { type PostgresTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/types/postgres-table-schema-column';
import { isQueryTimeoutError } from 'src/engine/utils/query-timeout.util';

@Injectable()
export class DistantTableService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async fetchDistantTables(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
    tableName?: string,
  ): Promise<DistantTables> {
    if (remoteServer.schema) {
      return this.getDistantTablesFromDynamicSchema(
        remoteServer,
        workspaceId,
        tableName,
      );
    }

    return this.getDistantTablesFromStaticSchema(remoteServer);
  }

  public async getDistantTableColumns(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
    tableName: string,
  ): Promise<PostgresTableSchemaColumn[]> {
    const distantTables = await this.fetchDistantTables(
      remoteServer,
      workspaceId,
      tableName,
    );

    return distantTables[tableName];
  }

  private async getDistantTablesFromDynamicSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    workspaceId: string,
    tableName?: string,
  ): Promise<DistantTables> {
    if (!remoteServer.schema) {
      throw new DistantTableException(
        'Remote server schema is not defined',
        DistantTableExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const tmpSchemaId = v4();
    const tmpSchemaName = `${workspaceId}_${remoteServer.id}_${tmpSchemaId}`;

    try {
      const distantTables = await this.coreDataSource.transaction(
        async (entityManager: EntityManager) => {
          await entityManager.query(`CREATE SCHEMA "${tmpSchemaName}"`);

          const tableLimitationsOptions = tableName
            ? ` LIMIT TO ("${tableName}")`
            : '';

          await entityManager.query(
            `IMPORT FOREIGN SCHEMA "${remoteServer.schema}"${tableLimitationsOptions} FROM SERVER "${remoteServer.foreignDataWrapperId}" INTO "${tmpSchemaName}"`,
          );

          const createdForeignTableNames = await entityManager.query(
            `SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = '${tmpSchemaName}'`,
          );

          await entityManager.query(`DROP SCHEMA "${tmpSchemaName}" CASCADE`);

          return createdForeignTableNames.reduce(
            // @ts-expect-error legacy noImplicitAny
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

      return distantTables;
    } catch (error) {
      if (isQueryTimeoutError(error)) {
        throw new DistantTableException(
          `Could not find distant tables: ${error.message}`,
          DistantTableExceptionCode.TIMEOUT_ERROR,
        );
      }

      throw error;
    }
  }

  private getDistantTablesFromStaticSchema(
    remoteServer: RemoteServerEntity<RemoteServerType>,
  ): DistantTables {
    switch (remoteServer.foreignDataWrapperType) {
      case RemoteServerType.STRIPE_FDW:
        return STRIPE_DISTANT_TABLES;
      default:
        throw new DistantTableException(
          `Type ${remoteServer.foreignDataWrapperType} does not have a static schema.`,
          DistantTableExceptionCode.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
