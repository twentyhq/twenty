import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { v4 as uuidv4 } from 'uuid';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  mktTemporaryPermissionsAllView,
  mktActiveTemporaryPermissionsView,
  mktExpiredTemporaryPermissionsView,
  mktRevokedTemporaryPermissionsView,
} from 'src/mkt-core/dev-seeder/prefill-view/mkt-temporary-permission-all.view';
import { prefillMktTemporaryPermissions } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-temporary-permissions';

interface SeedTemporaryPermissionModuleOptions {
  workspaceId?: string;
}

@Command({
  name: 'workspace:seed:temporary-permission-module',
  description:
    'Seed temporary permission module views and data for existing workspace',
})
export class SeedMktTemporaryPermissionCommand extends CommandRunner {
  private readonly logger = new Logger(SeedMktTemporaryPermissionCommand.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id to seed temporary permission module for',
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    passedParam: string[],
    options: SeedTemporaryPermissionModuleOptions,
  ): Promise<void> {
    let workspaces: Workspace[] = [];

    if (options.workspaceId) {
      const workspace = await this.workspaceRepository.findOne({
        where: { id: options.workspaceId },
      });

      if (workspace) {
        workspaces = [workspace];
      } else {
        this.logger.error(`Workspace ${options.workspaceId} not found`);

        return;
      }
    } else {
      // Seed for all active workspaces
      workspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      });
    }

    for (const workspace of workspaces) {
      try {
        await this.seedTemporaryPermissionModuleForWorkspace(workspace.id);
        this.logger.log(
          `✅ Temporary permission module seeded for workspace: ${workspace.id}`,
        );
        await this.workspaceCacheStorageService.flush(workspace.id, undefined);
      } catch (error) {
        this.logger.error(
          `❌ Failed to seed temporary permission module for workspace ${workspace.id}:`,
          error,
        );
      }
    }
  }

  private async seedTemporaryPermissionModuleForWorkspace(
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `🚀 Starting temporary permission module seeding for workspace ${workspaceId}`,
    );

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // Find temporary permission object metadata
    const tempPermObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === 'mktTemporaryPermission',
    );

    if (!tempPermObjectMetadata) {
      this.logger.log(
        `Temporary permission object not found in workspace ${workspaceId}, skipping...`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await mainDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        // Seed temporary permission data first
        await prefillMktTemporaryPermissions(entityManager, schemaName);

        // Create all views
        const viewDefinitions = [
          mktTemporaryPermissionsAllView(objectMetadataItems),
          mktActiveTemporaryPermissionsView(objectMetadataItems),
          mktExpiredTemporaryPermissionsView(objectMetadataItems),
          mktRevokedTemporaryPermissionsView(objectMetadataItems),
        ];

        for (const viewDefinition of viewDefinitions) {
          if (!viewDefinition) continue;

          // Check if view already exists
          const existingView = await entityManager
            .createQueryBuilder(undefined, undefined, undefined, {
              shouldBypassPermissionChecks: true,
            })
            .select('*')
            .from(`${schemaName}.view`, 'view')
            .where('view.name = :name', { name: viewDefinition.name })
            .getRawOne();

          if (existingView) {
            this.logger.log(
              `View "${viewDefinition.name}" already exists for workspace ${workspaceId}. Skipping...`,
            );
            continue;
          }

          const viewDefinitionWithId = {
            ...viewDefinition,
            id: uuidv4(),
          };

          // Insert view
          await entityManager
            .createQueryBuilder(undefined, undefined, undefined, {
              shouldBypassPermissionChecks: true,
            })
            .insert()
            .into(`${schemaName}.view`, [
              'id',
              'name',
              'objectMetadataId',
              'type',
              'key',
              'position',
              'icon',
              'openRecordIn',
              'kanbanFieldMetadataId',
            ])
            .values({
              id: viewDefinitionWithId.id,
              name: viewDefinitionWithId.name,
              objectMetadataId: viewDefinitionWithId.objectMetadataId,
              type: viewDefinitionWithId.type,
              key: viewDefinitionWithId.key,
              position: viewDefinitionWithId.position,
              icon: viewDefinitionWithId.icon,
              openRecordIn: viewDefinitionWithId.openRecordIn,
              kanbanFieldMetadataId: viewDefinitionWithId.kanbanFieldMetadataId,
            })
            .execute();

          // Insert view fields
          if (
            viewDefinitionWithId.fields &&
            viewDefinitionWithId.fields.length > 0
          ) {
            await entityManager
              .createQueryBuilder(undefined, undefined, undefined, {
                shouldBypassPermissionChecks: true,
              })
              .insert()
              .into(`${schemaName}.viewField`, [
                'id',
                'fieldMetadataId',
                'position',
                'isVisible',
                'size',
                'viewId',
              ])
              .values(
                viewDefinitionWithId.fields.map((field) => ({
                  id: uuidv4(),
                  fieldMetadataId: field.fieldMetadataId,
                  position: field.position,
                  isVisible: field.isVisible,
                  size: field.size,
                  viewId: viewDefinitionWithId.id,
                })),
              )
              .execute();
          }

          // Insert view filters if any
          if (
            viewDefinitionWithId.filters &&
            viewDefinitionWithId.filters.length > 0
          ) {
            await entityManager
              .createQueryBuilder(undefined, undefined, undefined, {
                shouldBypassPermissionChecks: true,
              })
              .insert()
              .into(`${schemaName}.viewFilter`, [
                'id',
                'fieldMetadataId',
                'operand',
                'value',
                'displayValue',
                'viewId',
              ])
              .values(
                (
                  viewDefinitionWithId.filters as Array<{
                    fieldMetadataId: string;
                    operand: string;
                    value: unknown;
                    displayValue: string;
                  }>
                ).map((filter) => ({
                  id: uuidv4(),
                  fieldMetadataId: filter.fieldMetadataId,
                  operand: filter.operand,
                  value: filter.value,
                  displayValue: filter.displayValue,
                  viewId: viewDefinitionWithId.id,
                })),
              )
              .execute();
          }

          this.logger.log(
            `✅ View "${viewDefinition.name}" created for workspace ${workspaceId}`,
          );
        }
      },
    );
  }
}
