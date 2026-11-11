/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { buildCreatePermissionSystemTablesStatements } from 'src/engine/permissions/system-table/utils/build-create-permission-system-tables-statements.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class PermissionSystemTableService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async createTables({ workspaceId }: { workspaceId: string }): Promise<void> {
    await this.coreDataSource.transaction(async (entityManager) => {
      for (const statement of buildCreatePermissionSystemTablesStatements({
        schemaName: getWorkspaceSchemaName(workspaceId),
      })) {
        await entityManager.query(statement);
      }
    });
  }
}
