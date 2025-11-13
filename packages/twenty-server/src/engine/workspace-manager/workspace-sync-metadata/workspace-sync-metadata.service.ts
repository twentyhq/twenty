import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, QueryFailedError } from 'typeorm';

import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import {
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceSyncAgentService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-agent.service';
import { WorkspaceSyncFieldMetadataRelationService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-field-metadata-relation.service';
import { WorkspaceSyncFieldMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-field-metadata.service';
import { WorkspaceSyncIndexMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-index-metadata.service';
import { WorkspaceSyncObjectMetadataIdentifiersService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-object-metadata-identifiers.service';
import { WorkspaceSyncObjectMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-object-metadata.service';
import { WorkspaceSyncRoleService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-role.service';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';

interface SynchronizeOptions {
  applyChanges?: boolean;
}

@Injectable()
export class WorkspaceSyncMetadataService {
  private readonly logger = new Logger(WorkspaceSyncMetadataService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceSyncObjectMetadataService: WorkspaceSyncObjectMetadataService,
    private readonly workspaceSyncFieldMetadataService: WorkspaceSyncFieldMetadataService,
    private readonly workspaceSyncFieldMetadataRelationService: WorkspaceSyncFieldMetadataRelationService,
    private readonly workspaceSyncIndexMetadataService: WorkspaceSyncIndexMetadataService,
    private readonly workspaceSyncObjectMetadataIdentifiersService: WorkspaceSyncObjectMetadataIdentifiersService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspaceSyncRoleService: WorkspaceSyncRoleService,
    private readonly workspaceSyncAgentService: WorkspaceSyncAgentService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  /**
   *
   * Sync all standard objects and fields metadata for a given workspace and data source
   * This will update the metadata if it has changed and generate migrations based on the diff.
   *
   * @param context
   * @param options
   */
  public async synchronize(
    context: WorkspaceSyncContext,
    options: SynchronizeOptions = { applyChanges: true },
  ): Promise<{
    workspaceMigrations: WorkspaceMigrationEntity[];
    storage: WorkspaceSyncStorage;
  }> {
    let workspaceMigrations: WorkspaceMigrationEntity[] = [];
    const storage = new WorkspaceSyncStorage();

    const queryRunner = this.coreDataSource.createQueryRunner();

    this.logger.log('Syncing standard objects and fields metadata');

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      const workspaceMigrationRepository = manager.getRepository(
        WorkspaceMigrationEntity,
      );

      this.logger.log('Syncing standard objects and fields metadata');

      // 1 - Sync standard objects

      const workspaceObjectMigrationsStart = performance.now();
      const workspaceObjectMigrations =
        await this.workspaceSyncObjectMetadataService.synchronize(
          context,
          manager,
          storage,
        );

      const workspaceObjectMigrationsEnd = performance.now();

      this.logger.log(
        `Workspace object migrations took ${workspaceObjectMigrationsEnd - workspaceObjectMigrationsStart}ms`,
      );

      // 2 - Sync standard fields on standard and custom objects
      const workspaceFieldMigrationsStart = performance.now();
      const workspaceFieldMigrations =
        await this.workspaceSyncFieldMetadataService.synchronize(
          context,
          manager,
          storage,
        );

      const workspaceFieldMigrationsEnd = performance.now();

      this.logger.log(
        `Workspace field migrations took ${workspaceFieldMigrationsEnd - workspaceFieldMigrationsStart}ms`,
      );

      // Merge object and field migrations during table creation
      const {
        objectMigrations: mergedObjectMigrations,
        fieldMigrations: mergedFieldMigrations,
      } = this.mergeMigrations({
        objectMigrations: workspaceObjectMigrations,
        fieldMigrations: workspaceFieldMigrations,
      });

      // 3 - Sync standard relations on standard and custom objects
      const workspaceRelationMigrationsStart = performance.now();

      let workspaceRelationMigrations: Partial<WorkspaceMigrationEntity>[] = [];

      workspaceRelationMigrations =
        await this.workspaceSyncFieldMetadataRelationService.synchronize(
          context,
          manager,
          storage,
        );

      const workspaceRelationMigrationsEnd = performance.now();

      this.logger.log(
        `Workspace relation migrations took ${workspaceRelationMigrationsEnd - workspaceRelationMigrationsStart}ms`,
      );

      // 4 - Sync standard indexes on standard objects
      const workspaceIndexMigrationsStart = performance.now();

      const workspaceIndexMigrations =
        await this.workspaceSyncIndexMetadataService.synchronize(
          context,
          manager,
          storage,
        );
      const workspaceIndexMigrationsEnd = performance.now();

      this.logger.log(
        `Workspace index migrations took ${workspaceIndexMigrationsEnd - workspaceIndexMigrationsStart}ms`,
      );

      // 5 - Sync standard object metadata identifiers, does not need to return nor apply migrations
      const workspaceObjectMetadataIdentifiersStart = performance.now();

      await this.workspaceSyncObjectMetadataIdentifiersService.synchronize(
        context,
        manager,
        storage,
      );

      const workspaceObjectMetadataIdentifiersEnd = performance.now();

      this.logger.log(
        `Workspace object metadata identifiers took ${workspaceObjectMetadataIdentifiersEnd - workspaceObjectMetadataIdentifiersStart}ms`,
      );

      // 6 - Sync standard roles
      const workspaceRoleMigrationsStart = performance.now();

      await this.workspaceSyncRoleService.synchronize(context, manager);

      const workspaceRoleMigrationsEnd = performance.now();

      this.logger.log(
        `Workspace role migrations took ${workspaceRoleMigrationsEnd - workspaceRoleMigrationsStart}ms`,
      );

      // 7 - Sync standard agents
      const workspaceAgentMigrationsStart = performance.now();

      await this.workspaceSyncAgentService.synchronize(context, manager);

      const workspaceAgentMigrationsEnd = performance.now();

      this.logger.log(
        `Workspace agent migrations took ${workspaceAgentMigrationsEnd - workspaceAgentMigrationsStart}ms`,
      );

      const workspaceMigrationsSaveStart = performance.now();

      // Save workspace migrations into the database
      workspaceMigrations = await workspaceMigrationRepository.save([
        ...mergedObjectMigrations,
        ...mergedFieldMigrations,
        ...workspaceRelationMigrations,
        ...workspaceIndexMigrations,
      ]);

      const workspaceMigrationsSaveEnd = performance.now();

      this.logger.log(
        `Workspace migrations save took ${workspaceMigrationsSaveEnd - workspaceMigrationsSaveStart}ms`,
      );

      // If we're running a dry run, rollback the transaction and do not execute migrations
      if (!options.applyChanges) {
        this.logger.log('Running in dry run mode, rolling back transaction');

        if (queryRunner.isTransactionActive) {
          try {
            await queryRunner.rollbackTransaction();
          } catch (error) {
            // eslint-disable-next-line no-console
            console.trace(`Failed to rollback transaction: ${error.message}`);
          }
        }

        await queryRunner.release();

        return {
          workspaceMigrations,
          storage,
        };
      }

      // Execute migrations
      this.logger.log('Executing pending migrations');
      const executeMigrationsStart = performance.now();

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
        context.workspaceId,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      const executeMigrationsEnd = performance.now();

      this.logger.log(
        `Execute migrations took ${executeMigrationsEnd - executeMigrationsStart}ms`,
      );
    } catch (error) {
      this.logger.error('Sync of standard objects failed with:', error);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (error instanceof QueryFailedError && (error as any).detail) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.logger.error((error as any).detail);
      }
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        context.workspaceId,
      );
      await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId: context.workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      });
    }

    return {
      workspaceMigrations,
      storage,
    };
  }

  private mergeMigrations({
    objectMigrations,
    fieldMigrations,
  }: {
    objectMigrations: Partial<WorkspaceMigrationEntity>[];
    fieldMigrations: Partial<WorkspaceMigrationEntity>[];
  }): {
    objectMigrations: Partial<WorkspaceMigrationEntity>[];
    fieldMigrations: Partial<WorkspaceMigrationEntity>[];
  } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createMigrationsByTable = new Map<string, any>();

    for (const objectMigration of objectMigrations) {
      if (
        !objectMigration.migrations ||
        objectMigration.migrations.length === 0
      )
        continue;

      const tableMigration = objectMigration.migrations[0];

      if (tableMigration.action === WorkspaceMigrationTableActionType.CREATE) {
        createMigrationsByTable.set(tableMigration.name, tableMigration);
      }
    }

    const fieldMigrationsWithoutTableCreation = fieldMigrations.filter(
      (fieldMigration) => {
        if (
          !fieldMigration.migrations ||
          fieldMigration.migrations.length === 0
        )
          return true;

        const tableMigration = fieldMigration.migrations[0];
        const tableName = tableMigration.name;

        if (createMigrationsByTable.has(tableName)) {
          const createMigration = createMigrationsByTable.get(tableName);

          if (tableMigration.columns?.length) {
            createMigration.columns = createMigration.columns || [];
            createMigration.columns.push(...tableMigration.columns);
          }

          return false;
        }

        return true;
      },
    );

    return {
      objectMigrations,
      fieldMigrations: fieldMigrationsWithoutTableCreation,
    };
  }
}
