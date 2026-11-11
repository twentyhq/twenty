/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/constants/permission-storage-object-universal-identifiers.constant';
import { buildCreatePermissionSystemTablesStatements } from 'src/engine/permissions/system-table/utils/build-create-permission-system-tables-statements.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@Injectable()
export class PermissionSystemTableService {
  private readonly logger = new Logger(PermissionSystemTableService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
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

  // Deleting through a workspace migration would drop the tables with their objects
  async detachTablesFromMetadata({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const [detachedObjects]: [{ id: string }[], number] =
      await this.coreDataSource.query(
        `DELETE FROM core."objectMetadata"
         WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)
         RETURNING "id"`,
        [workspaceId, PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS],
      );

    if (detachedObjects.length === 0) {
      return;
    }

    await this.workspaceMigrationRunnerService.invalidateCache({
      workspaceId,
      allFlatEntityMapsKeys: ALL_FLAT_ENTITY_MAPS_PROPERTIES,
    });

    this.logger.log(
      `Detached ${detachedObjects.length} permission system table(s) from metadata for workspace ${workspaceId}`,
    );
  }
}
