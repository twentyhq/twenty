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
import { mktOrderItemsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-order-item-all.view';
import { prefillMktOrderItems } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-order-items';
import { prefillMktOrders } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-orders';
import { prefillMktProducts } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-products';

interface SeedOrderItemModuleOptions {
  workspaceId?: string;
}

type OrderItemViewDefinition = ReturnType<typeof mktOrderItemsAllView>;

@Command({
  name: 'workspace:seed:order-item-module',
  description: 'Seed order item module views and data for existing workspace',
})
export class SeedOrderItemModuleCommand extends CommandRunner {
  private readonly logger = new Logger(SeedOrderItemModuleCommand.name);

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
    description: 'workspace id to seed order item module for',
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    passedParam: string[],
    options: SeedOrderItemModuleOptions,
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
        await this.seedOrderItemModuleForWorkspace(workspace.id);
        // Lấy viewId của view 'All Order Items' sau khi seed
        const mainDataSource =
          await this.workspaceDataSourceService.connectToMainDataSource();
        const schemaName = getWorkspaceSchemaName(workspace.id);
        const viewRow = await mainDataSource
          .createQueryBuilder()
          .select('id')
          .from(`${schemaName}.view`, 'view')
          .where('view.name = :name', { name: 'All Order Items' })
          .andWhere('view.key = :key', { key: 'INDEX' })
          .getRawOne();
        const orderItemViewId = viewRow?.id;

        if (orderItemViewId) {
          // Insert mới Favorite với viewId này
          await mainDataSource
            .createQueryBuilder()
            .insert()
            .into(`${schemaName}.favorite`, ['viewId'])
            .values([{ viewId: orderItemViewId }])
            .execute();
          this.logger.log(
            `✅ Inserted new Favorite record with viewId: ${orderItemViewId}`,
          );
        } else {
          this.logger.warn(
            '⚠️ Could not find viewId for All Order Items view to update Favorite records',
          );
        }
        this.logger.log(
          `✅ Order Item module seeded for workspace: ${workspace.id}`,
        );
        await this.workspaceCacheStorageService.flush(workspace.id, undefined);
      } catch (error) {
        this.logger.error(
          `❌ Failed to seed order item module for workspace ${workspace.id}:`,
          error,
        );
      }
    }
  }

  private async seedOrderItemModuleForWorkspace(
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `🚀 Starting order item module seeding for workspace ${workspaceId}`,
    );

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // Find order item object metadata
    const orderItemObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === 'mktOrderItem',
    );

    this.logger.log(
      `🔍 Debug - All objects in workspace: ${objectMetadataItems.map((item) => `${item.nameSingular}(${item.standardId})`).join(', ')}`,
    );
    this.logger.log(
      `🔍 Debug - Looking for order item object with nameSingular: 'mktOrderItem'`,
    );
    this.logger.log(
      `🔍 Debug - Order Item object found: ${orderItemObjectMetadata ? 'YES' : 'NO'}`,
    );

    if (!orderItemObjectMetadata) {
      this.logger.log(
        `Order Item object not found in workspace ${workspaceId}, skipping...`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await mainDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        // Check if order item view already exists by looking for a view with name 'All Order Items'
        const existingView = await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .select('*')
          .from(`${schemaName}.view`, 'view')
          .where('view.name = :name', { name: 'All Order Items' })
          .andWhere('view.key = :key', { key: 'INDEX' })
          .getRawOne();

        if (existingView) {
          this.logger.log(
            `Order Item view already exists for workspace ${workspaceId}. Deleting and recreating...`,
          );

          // Delete existing view (cascade will delete viewFields)
          await entityManager
            .createQueryBuilder(undefined, undefined, undefined, {
              shouldBypassPermissionChecks: true,
            })
            .delete()
            .from(`${schemaName}.view`)
            .where('name = :name', { name: 'All Order Items' })
            .andWhere('key = :key', { key: 'INDEX' })
            .execute();
        }

        // Create order item view
        const orderItemViewDefinition: OrderItemViewDefinition =
          mktOrderItemsAllView(objectMetadataItems);

        // Ensure Products and Orders exist before seeding OrderItems
        this.logger.log(
          '🔧 Seeding prerequisite data (Products and Orders)...',
        );

        // Check and seed products if they don't exist
        const existingProducts = await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .select('COUNT(*)')
          .from(`${schemaName}.mktProduct`, 'product')
          .getRawOne();

        if (!existingProducts.count || existingProducts.count === '0') {
          this.logger.log('📦 Seeding Products...');
          await prefillMktProducts(entityManager, schemaName);
        } else {
          this.logger.log(
            '📦 Products already exist, skipping product seeding',
          );
        }

        // Check and seed orders if they don't exist
        const existingOrders = await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .select('COUNT(*)')
          .from(`${schemaName}.mktOrder`, 'order')
          .getRawOne();

        if (!existingOrders.count || existingOrders.count === '0') {
          this.logger.log('🛒 Seeding Orders...');
          await prefillMktOrders(entityManager, schemaName);
        } else {
          this.logger.log('🛒 Orders already exist, skipping order seeding');
        }

        // Delete existing order items to prevent conflicts
        this.logger.log('🗑️ Clearing existing Order Items...');
        await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .delete()
          .from(`${schemaName}.mktOrderItem`)
          .execute();

        // Now seed mkt order items
        this.logger.log('🛍️ Seeding Order Items...');
        await prefillMktOrderItems(entityManager, schemaName);

        if (!orderItemViewDefinition) {
          this.logger.log(
            `Could not create order item view definition for workspace ${workspaceId}`,
          );

          return;
        }

        this.logger.log(
          `🔍 Debug - View definition created with ${orderItemViewDefinition.fields?.length || 0} fields`,
        );

        const viewDefinitionWithId = {
          ...orderItemViewDefinition,
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
          this.logger.log(`✅ View fields created successfully`);
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
          `✅ Order Item view created for workspace ${workspaceId}`,
        );
      },
    );
  }
}
