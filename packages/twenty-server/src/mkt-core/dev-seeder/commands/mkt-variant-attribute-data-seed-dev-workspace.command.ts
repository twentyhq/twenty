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
import { mktVariantAttributesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-variant-attribute-all.view';
import { prefillMktVariantAttributes } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-variant-attribute';

interface SeedVariantAttributeModuleOptions {
  workspaceId?: string;
}

@Command({
  name: 'workspace:seed:variant-attribute-module',
  description:
    'Seed variant attribute module views and data for existing workspace',
})
export class SeedVariantAttributeModuleCommand extends CommandRunner {
  private readonly logger = new Logger(SeedVariantAttributeModuleCommand.name);

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
    description: 'workspace id to seed product variant attribute module for',
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    passedParam: string[],
    options: SeedVariantAttributeModuleOptions,
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
        await this.seedVariantAttributeModuleForWorkspace(workspace.id);
        // Get viewId of view 'All Variant Attributes' after seed
        const mainDataSource =
          await this.workspaceDataSourceService.connectToMainDataSource();
        const schemaName = getWorkspaceSchemaName(workspace.id);
        const viewRow = await mainDataSource
          .createQueryBuilder()
          .select('id')
          .from(`${schemaName}.view`, 'view')
          .where('view.name = :name', { name: 'All Variant Attributes' })
          .andWhere('view.key = :key', { key: 'INDEX' })
          .getRawOne();
        const variantAttributeViewId = viewRow?.id;

        if (variantAttributeViewId) {
          // Insert new variant attribute with viewId
          await mainDataSource
            .createQueryBuilder()
            .insert()
            .into(`${schemaName}.favorite`, ['viewId'])
            .values([{ viewId: variantAttributeViewId }])
            .execute();
          this.logger.log(
            `✅ Inserted new product variant attribute record with viewId: ${variantAttributeViewId}`,
          );
        } else {
          this.logger.warn(
            '⚠️ Could not find viewId for All Variant Attributes view to update product variant attribute records',
          );
        }
        this.logger.log(
          `✅ Product Variant Attribute module seeded for workspace: ${workspace.id}`,
        );
        await this.workspaceCacheStorageService.flush(workspace.id, undefined);
      } catch (error) {
        this.logger.error(
          `❌ Failed to seed product variant attribute module for workspace ${workspace.id}:`,
          error,
        );
      }
    }
  }

  private async seedVariantAttributeModuleForWorkspace(
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `🚀 Starting product variant attribute module seeding for workspace ${workspaceId}`,
    );

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // Find variant attribute object metadata
    const variantAttributeObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === 'mktVariantAttribute',
    );

    this.logger.log(
      `🔍 Debug - All objects in workspace: ${objectMetadataItems.map((item) => `${item.nameSingular}(${item.standardId})`).join(', ')}`,
    );
    this.logger.log(
      `🔍 Debug - Looking for product variant attribute object with nameSingular: 'mktVariantAttribute'`,
    );
    this.logger.log(
      `🔍 Debug - Product variant attribute object found: ${variantAttributeObjectMetadata ? 'YES' : 'NO'}`,
    );

    if (!variantAttributeObjectMetadata) {
      this.logger.log(
        `Product variant attribute object not found in workspace ${workspaceId}, skipping...`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await mainDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        // Check if product variant attribute view already exists by looking for a view with name 'All Variant Attributes'
        const existingView = await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .select('*')
          .from(`${schemaName}.view`, 'view')
          .where('view.name = :name', { name: 'All Variant Attributes' })
          .andWhere('view.key = :key', { key: 'INDEX' })
          .getRawOne();

        if (existingView) {
          this.logger.log(
            `Product variant attribute view already exists for workspace ${workspaceId}. Deleting and recreating...`,
          );

          // Delete existing view (cascade will delete viewFields)
          await entityManager
            .createQueryBuilder(undefined, undefined, undefined, {
              shouldBypassPermissionChecks: true,
            })
            .delete()
            .from(`${schemaName}.view`)
            .where('name = :name', { name: 'All Variant Attributes' })
            .andWhere('key = :key', { key: 'INDEX' })
            .execute();
        }

        // Create variant attribute view
        const variantAttributeViewDefinition =
          mktVariantAttributesAllView(objectMetadataItems);

        // Seed mkt variant attributes
        await prefillMktVariantAttributes(entityManager, schemaName);

        if (!variantAttributeViewDefinition) {
          this.logger.log(
            `Could not create product variant attribute view definition for workspace ${workspaceId}`,
          );

          return;
        }

        this.logger.log(
          `🔍 Debug - View definition created with ${variantAttributeViewDefinition.fields?.length || 0} fields`,
        );

        const viewDefinitionWithId = {
          ...variantAttributeViewDefinition,
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
          this.logger.log(
            `✅ Product Variant Attribute view fields created successfully`,
          );
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

        this.logger.log(
          `✅ Product Variant Attribute view created for workspace ${workspaceId}`,
        );
      },
    );
  }
}
