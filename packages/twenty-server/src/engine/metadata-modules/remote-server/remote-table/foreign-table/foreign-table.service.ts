import { Injectable } from '@nestjs/common';

import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import {
  ForeignTableException,
  ForeignTableExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-table/foreign-table/foreign-table.exception';
import { getForeignTableColumnName } from 'src/engine/metadata-modules/remote-server/remote-table/foreign-table/utils/get-foreign-table-column-name.util';
import { PostgresTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/types/postgres-table-schema-column';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  ReferencedTable,
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationForeignColumnDefinition,
  WorkspaceMigrationForeignTable,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

@Injectable()
export class ForeignTableService {
  constructor(
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {}

  public async fetchForeignTableNamesWithinWorkspace(
    workspaceId: string,
    foreignDataWrapperId: string,
  ): Promise<string[]> {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    return (
      await mainDataSource.query(
        `SELECT foreign_table_name, foreign_server_name FROM information_schema.foreign_tables WHERE foreign_server_name = $1`,
        [foreignDataWrapperId],
      )
    ).map((foreignTable) => foreignTable.foreign_table_name);
  }

  public async createForeignTable(
    workspaceId: string,
    localTableName: string,
    remoteServer: RemoteServerEntity<RemoteServerType>,
    distantTableName: string,
    distantTableColumns: PostgresTableSchemaColumn[],
  ) {
    const referencedTable: ReferencedTable = this.buildReferencedTable(
      remoteServer,
      distantTableName,
    );

    const workspaceMigration =
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`create-foreign-table-${localTableName}`),
        workspaceId,
        [
          {
            name: localTableName,
            action: WorkspaceMigrationTableActionType.CREATE_FOREIGN_TABLE,
            foreignTable: {
              columns: distantTableColumns.map(
                (column) =>
                  ({
                    columnName: getForeignTableColumnName(column.columnName),
                    columnType: column.dataType,
                    distantColumnName: column.columnName,
                    isNullable: false,
                    defaultValue: null,
                  }) satisfies WorkspaceMigrationForeignColumnDefinition,
              ),
              referencedTable,
              foreignDataWrapperId: remoteServer.foreignDataWrapperId,
            } satisfies WorkspaceMigrationForeignTable,
          },
        ],
      );

    // TODO: This should be done in a transaction. Waiting for a global refactoring of transaction management.
    try {
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );
    } catch (exception) {
      this.workspaceMigrationService.deleteById(workspaceMigration.id);

      throw new ForeignTableException(
        'Could not create foreign table. The table may already exists or a column type may not be supported.',
        ForeignTableExceptionCode.INVALID_FOREIGN_TABLE_INPUT,
      );
    }
  }

  public async updateForeignTable(
    foreignTableName: string,
    workspaceId: string,
    columnsUpdates: WorkspaceMigrationColumnAction[],
  ) {
    const workspaceMigration =
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`alter-foreign-table-${foreignTableName}`),
        workspaceId,
        [
          {
            name: foreignTableName,
            action: WorkspaceMigrationTableActionType.ALTER_FOREIGN_TABLE,
            columns: columnsUpdates,
          },
        ],
      );

    // TODO: This should be done in a transaction. Waiting for a global refactoring of transaction management.
    try {
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      return {
        name: foreignTableName,
        status: RemoteTableStatus.SYNCED,
        schemaPendingUpdates: [],
      };
    } catch (exception) {
      this.workspaceMigrationService.deleteById(workspaceMigration.id);

      throw new ForeignTableException(
        'Could not alter foreign table.',
        ForeignTableExceptionCode.FOREIGN_TABLE_MUTATION_NOT_ALLOWED,
      );
    }
  }

  public async deleteForeignTable(
    foreignTableName: string,
    workspaceId: string,
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`drop-foreign-table-${foreignTableName}`),
      workspaceId,
      [
        {
          name: foreignTableName,
          action: WorkspaceMigrationTableActionType.DROP_FOREIGN_TABLE,
        },
      ],
    );

    return this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );
  }

  private buildReferencedTable(
    remoteServer: RemoteServerEntity<RemoteServerType>,
    distantTableName: string,
  ): ReferencedTable {
    switch (remoteServer.foreignDataWrapperType) {
      case RemoteServerType.POSTGRES_FDW:
        return {
          table_name: distantTableName,
          schema_name: remoteServer.schema,
        };
      case RemoteServerType.STRIPE_FDW:
        return { object: distantTableName };
      default:
        throw new ForeignTableException(
          'Foreign data wrapper not supported',
          ForeignTableExceptionCode.INVALID_FOREIGN_TABLE_INPUT,
        );
    }
  }
}
