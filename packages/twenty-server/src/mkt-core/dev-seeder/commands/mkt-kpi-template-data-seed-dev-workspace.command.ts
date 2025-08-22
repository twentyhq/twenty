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
import { mktKpiTemplatesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-kpi-template-all.view';
import { prefillMktKpiTemplates } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-kpi-templates';

interface SeedKpiTemplateModuleOptions {
  workspaceId?: string;
}

type KpiTemplateViewDefinition = ReturnType<typeof mktKpiTemplatesAllView>;

@Command({
  name: 'workspace:seed:kpi-template-module',
  description: 'Seed KPI Template module views and data for existing workspace',
})
export class SeedMktKpiTemplateCommand extends CommandRunner {
  private readonly logger = new Logger(SeedMktKpiTemplateCommand.name);

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
    description: 'workspace id to seed kpi template module for',
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    passedParam: string[],
    options: SeedKpiTemplateModuleOptions,
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
        await this.seedKpiTemplateModuleForWorkspace(workspace.id);

        // Get viewId of 'All KPI Templates' view after seed
        const mainDataSource =
          await this.workspaceDataSourceService.connectToMainDataSource();
        const schemaName = getWorkspaceSchemaName(workspace.id);
        const viewRow = await mainDataSource
          .createQueryBuilder()
          .select('id')
          .from(`${schemaName}.view`, 'view')
          .where('view.name = :name', { name: 'All KPI Templates' })
          .andWhere('view.key = :key', { key: 'INDEX' })
          .getRawOne();
        const kpiTemplateViewId = viewRow?.id;

        if (kpiTemplateViewId) {
          // Insert new Favorite with this viewId
          await mainDataSource
            .createQueryBuilder()
            .insert()
            .into(`${schemaName}.favorite`, ['viewId'])
            .values([{ viewId: kpiTemplateViewId }])
            .execute();
          this.logger.log(
            `✅ Inserted new Favorite record with viewId: ${kpiTemplateViewId}`,
          );
        } else {
          this.logger.warn(
            '⚠️ Could not find viewId for All KPI Templates view to update Favorite records',
          );
        }

        this.logger.log(
          `✅ KPI Template module seeded for workspace: ${workspace.id}`,
        );
        await this.workspaceCacheStorageService.flush(workspace.id, undefined);
      } catch (error) {
        this.logger.error(
          `❌ Failed to seed KPI Template module for workspace ${workspace.id}:`,
          error,
        );
      }
    }
  }

  private async seedKpiTemplateModuleForWorkspace(
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `🚀 Starting KPI Template module seeding for workspace ${workspaceId}`,
    );

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // Find kpi template object metadata
    const kpiTemplateObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === 'mktKpiTemplate',
    );

    this.logger.log(
      `🔍 Debug - All objects in workspace: ${objectMetadataItems.map((item) => `${item.nameSingular}(${item.standardId})`).join(', ')}`,
    );
    this.logger.log(
      `🔍 Debug - Looking for KPI Template object with nameSingular: 'mktKpiTemplate'`,
    );
    this.logger.log(
      `🔍 Debug - KPI Template object found: ${kpiTemplateObjectMetadata ? 'YES' : 'NO'}`,
    );

    if (!kpiTemplateObjectMetadata) {
      this.logger.log(
        `KPI Template object not found in workspace ${workspaceId}, skipping...`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await mainDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        // Check if kpi template view already exists
        const existingView = await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .select('*')
          .from(`${schemaName}.view`, 'view')
          .where('view.name = :name', { name: 'All KPI Templates' })
          .andWhere('view.key = :key', { key: 'INDEX' })
          .getRawOne();

        if (existingView) {
          this.logger.log(
            `KPI Template view already exists for workspace ${workspaceId}. Deleting and recreating...`,
          );

          // Delete existing view (cascade will delete viewFields)
          await entityManager
            .createQueryBuilder(undefined, undefined, undefined, {
              shouldBypassPermissionChecks: true,
            })
            .delete()
            .from(`${schemaName}.view`)
            .where('name = :name', { name: 'All KPI Templates' })
            .andWhere('key = :key', { key: 'INDEX' })
            .execute();
        }

        // Create kpi template view
        const kpiTemplateViewDefinition: KpiTemplateViewDefinition =
          mktKpiTemplatesAllView(objectMetadataItems);

        // Seed mkt kpi templates
        await prefillMktKpiTemplates(entityManager, schemaName);

        if (!kpiTemplateViewDefinition) {
          this.logger.log(
            `Could not create KPI Template view definition for workspace ${workspaceId}`,
          );

          return;
        }

        this.logger.log(
          `🔍 Debug - View definition created with ${kpiTemplateViewDefinition.fields?.length || 0} fields`,
        );

        const viewDefinitionWithId = {
          ...kpiTemplateViewDefinition,
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
          this.logger.log(
            `🔍 Debug - Creating ${viewDefinitionWithId.fields.length} view fields`,
          );
          await entityManager
            .createQueryBuilder(undefined, undefined, undefined, {
              shouldBypassPermissionChecks: true,
            })
            .insert()
            .into(`${schemaName}.viewField`, [
              'fieldMetadataId',
              'position',
              'isVisible',
              'size',
              'viewId',
            ])
            .values(
              viewDefinitionWithId.fields.map((field) => ({
                ...field,
                viewId: viewDefinitionWithId.id,
              })),
            )
            .execute();
        }

        this.logger.log(
          `✅ KPI Template view and data seeded successfully for workspace ${workspaceId}`,
        );
      },
    );
  }
}
