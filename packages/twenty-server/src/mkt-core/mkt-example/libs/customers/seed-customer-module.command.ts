import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { customersAllView } from 'src/mkt-core/mkt-example/libs/customers/prefill-data/customers-all.view';
import { prefillCustomers } from 'src/mkt-core/mkt-example/libs/customers/prefill-data/prefill-customers';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { v4 as uuidv4 } from 'uuid';

interface SeedCustomerModuleOptions {
  workspaceId?: string;
}

@Command({
  name: 'workspace:seed:customer-module',
  description: 'Seed customer module views and data for existing workspace',
})
export class SeedCustomerModuleCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCustomerModuleCommand.name);

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
    description: 'workspace id to seed customer module for',
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    passedParam: string[],
    options: SeedCustomerModuleOptions,
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
          activationStatus: WorkspaceActivationStatus.ACTIVE
        },
      });
    }

    for (const workspace of workspaces) {
      try {
        await this.seedCustomerModuleForWorkspace(workspace.id);
        // Lấy viewId của view 'All Customers' sau khi seed
        const mainDataSource = await this.workspaceDataSourceService.connectToMainDataSource();
        const schemaName = getWorkspaceSchemaName(workspace.id);
        const viewRow = await mainDataSource
          .createQueryBuilder()
          .select('id')
          .from(`${schemaName}.view`, 'view')
          .where('view.name = :name', { name: 'All Customers' })
          .andWhere('view.key = :key', { key: 'INDEX' })
          .getRawOne();
        const customerViewId = viewRow?.id;
        if (customerViewId) {
          // Insert mới Favorite với viewId này
          await mainDataSource
            .createQueryBuilder()
            .insert()
            .into(`${schemaName}.favorite`, ['viewId'])
            .values([{ viewId: customerViewId }])
            .execute();
          this.logger.log(`✅ Inserted new Favorite record with viewId: ${customerViewId}`);
        } else {
          this.logger.warn('⚠️ Could not find viewId for All Customers view to update Favorite records');
        }
        //await this.seedFavoriteForWorkspace(workspace.id);
        this.logger.log(`✅ Customer module seeded for workspace: ${workspace.id}`);
        await this.workspaceCacheStorageService.flush(workspace.id, undefined);
      } catch (error) {
        this.logger.error(`❌ Failed to seed customer module for workspace ${workspace.id}:`, error);
      }
    }
  }

  private async seedCustomerModuleForWorkspace(workspaceId: string): Promise<void> {
    this.logger.log(`🚀 Starting customer module seeding for workspace ${workspaceId}`);

    const mainDataSource = await this.workspaceDataSourceService.connectToMainDataSource();
    
    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const objectMetadataItems = await this.objectMetadataService.findManyWithinWorkspace(workspaceId);
    
    // Find customer object metadata
    const customerObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === 'mktCustomer'
    );

    this.logger.log(`🔍 Debug - All objects in workspace: ${objectMetadataItems.map(item => `${item.nameSingular}(${item.standardId})`).join(', ')}`);
    this.logger.log(`🔍 Debug - Looking for customer object with nameSingular: 'mktCustomer'`);
    this.logger.log(`🔍 Debug - Customer object found: ${customerObjectMetadata ? 'YES' : 'NO'}`);

    if (!customerObjectMetadata) {
      this.logger.log(`Customer object not found in workspace ${workspaceId}, skipping...`);
      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await mainDataSource.transaction(async (entityManager: WorkspaceEntityManager) => {
      // Check if customer view already exists by looking for a view with name 'All Customers'
      const existingView = await entityManager
        .createQueryBuilder(undefined, undefined, undefined, {
          shouldBypassPermissionChecks: true,
        })
        .select('*')
        .from(`${schemaName}.view`, 'view')
        .where('view.name = :name', { name: 'All Customers' })
        .andWhere('view.key = :key', { key: 'INDEX' })
        .getRawOne();

      if (existingView) {
        this.logger.log(`Customer view already exists for workspace ${workspaceId}. Deleting and recreating...`);
        
        // Delete existing view (cascade will delete viewFields)
        await entityManager
          .createQueryBuilder(undefined, undefined, undefined, {
            shouldBypassPermissionChecks: true,
          })
          .delete()
          .from(`${schemaName}.view`)
          .where('name = :name', { name: 'All Customers' })
          .andWhere('key = :key', { key: 'INDEX' })
          .execute();
      }

      // Create customer view
      const customerViewDefinition = customersAllView(objectMetadataItems);
      await prefillCustomers(entityManager, schemaName);
      
      if (!customerViewDefinition) {
        this.logger.log(`Could not create customer view definition for workspace ${workspaceId}`);
        return;
      }

      this.logger.log(`🔍 Debug - View definition created with ${customerViewDefinition.fields?.length || 0} fields`);

      const viewDefinitionWithId = {
        ...customerViewDefinition,
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
      if (viewDefinitionWithId.fields && viewDefinitionWithId.fields.length > 0) {
        this.logger.log(`🔍 Debug - Creating ${viewDefinitionWithId.fields.length} view fields`);
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
            viewDefinitionWithId.fields.map((field: any) => ({
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
      if (viewDefinitionWithId.filters && viewDefinitionWithId.filters.length > 0) {
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
            viewDefinitionWithId.filters.map((filter: any) => ({
              fieldMetadataId: filter.fieldMetadataId,
              operand: filter.operand,
              value: filter.value,
              displayValue: filter.displayValue,
              viewId: viewDefinitionWithId.id,
            })),
          )
          .execute();
      }

      this.logger.log(`✅ Customer view created for workspace ${workspaceId}`);
    });
  }
}
