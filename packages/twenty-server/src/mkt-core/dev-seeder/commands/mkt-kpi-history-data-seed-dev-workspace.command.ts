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
import { mktKpiHistoriesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-kpi-histories-all.view';
import { prefillMktKpiHistories } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-kpi-histories';

interface SeedKpiHistoryModuleOptions {
  workspaceId?: string;
}

type KpiHistoryViewDefinition = ReturnType<typeof mktKpiHistoriesAllView>;

@Command({
  name: 'workspace:seed:kpi-history-module',
  description: 'Seed KPI History module views and data for existing workspace',
})
export class SeedMktKpiHistoryCommand extends CommandRunner {
  private readonly logger = new Logger(SeedMktKpiHistoryCommand.name);

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
    description: 'workspace id to seed kpi history module for',
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    passedParam: string[],
    options: SeedKpiHistoryModuleOptions,
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
      workspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      });
    }

    for (const workspace of workspaces) {
      try {
        await this.seedKpiHistoryModuleForWorkspace(workspace.id);
        this.logger.log(
          `✅ KPI History module seeded for workspace: ${workspace.id}`,
        );
        await this.workspaceCacheStorageService.flush(workspace.id, undefined);
      } catch (error) {
        this.logger.error(
          `❌ Failed to seed KPI History module for workspace ${workspace.id}:`,
          error,
        );
      }
    }
  }

  private async seedKpiHistoryModuleForWorkspace(
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `🚀 Starting KPI History module seeding for workspace ${workspaceId}`,
    );

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // Find kpi history object metadata
    const kpiHistoryObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === 'mktKpiHistory',
    );

    this.logger.log(
      `🔍 Debug - Looking for KPI History object with nameSingular: 'mktKpiHistory'`,
    );
    this.logger.log(
      `🔍 Debug - KPI History object found: ${kpiHistoryObjectMetadata ? 'YES' : 'NO'}`,
    );

    if (!kpiHistoryObjectMetadata) {
      this.logger.log(
        `KPI History object not found in workspace ${workspaceId}, skipping...`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await mainDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        // Check if kpi history views already exist
        const existingViews = await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .select('*')
          .from(`${schemaName}.view`, 'view')
          .where('view.name IN (:...names)', {
            names: ['All KPI Histories', 'Recent Changes'],
          })
          .getRawMany();

        if (existingViews.length > 0) {
          this.logger.log(
            `KPI History views already exist for workspace ${workspaceId}. Deleting and recreating...`,
          );

          // Delete existing views (cascade will delete viewFields)
          await entityManager
            .createQueryBuilder(undefined, undefined, undefined, {
              shouldBypassPermissionChecks: true,
            })
            .delete()
            .from(`${schemaName}.view`)
            .where('name IN (:...names)', {
              names: ['All KPI Histories', 'Recent Changes'],
            })
            .execute();
        }

        // Seed mkt kpi histories data
        await prefillMktKpiHistories(entityManager, schemaName);

        // Create kpi history views
        const kpiHistoryViewDefinitions: KpiHistoryViewDefinition =
          mktKpiHistoriesAllView(objectMetadataItems);

        for (const viewDefinition of kpiHistoryViewDefinitions) {
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
                  fieldMetadataId: filter.fieldMetadataId,
                  operand: filter.operand,
                  value: filter.value,
                  displayValue: filter.displayValue,
                  viewId: viewDefinitionWithId.id,
                })),
              )
              .execute();
          }

          // Insert view sorts if any
          if (
            viewDefinitionWithId.sorts &&
            viewDefinitionWithId.sorts.length > 0
          ) {
            await entityManager
              .createQueryBuilder(undefined, undefined, undefined, {
                shouldBypassPermissionChecks: true,
              })
              .insert()
              .into(`${schemaName}.viewSort`, [
                'fieldMetadataId',
                'direction',
                'viewId',
              ])
              .values(
                (
                  viewDefinitionWithId.sorts as Array<{
                    fieldMetadataId: string;
                    direction: string;
                  }>
                ).map((sort) => ({
                  fieldMetadataId: sort.fieldMetadataId,
                  direction: sort.direction,
                  viewId: viewDefinitionWithId.id,
                })),
              )
              .execute();
          }
        }

        this.logger.log(
          `✅ KPI History views created for workspace ${workspaceId}`,
        );
      },
    );
  }
}
