import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceHealthFixKind } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-fix-kind.interface';
import { WorkspaceHealthIssue } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';
import {
  WorkspaceHealthMode,
  WorkspaceHealthOptions,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-options.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { DatabaseStructureService } from 'src/engine/workspace-manager/workspace-health/services/database-structure.service';
import { FieldMetadataHealthService } from 'src/engine/workspace-manager/workspace-health/services/field-metadata-health.service';
import { ObjectMetadataHealthService } from 'src/engine/workspace-manager/workspace-health/services/object-metadata-health.service';
import { RelationMetadataHealthService } from 'src/engine/workspace-manager/workspace-health/services/relation-metadata.health.service';
import { WorkspaceFixService } from 'src/engine/workspace-manager/workspace-health/services/workspace-fix.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

@Injectable()
export class WorkspaceHealthService {
  private readonly logger = new Logger(WorkspaceHealthService.name);

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly databaseStructureService: DatabaseStructureService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataHealthService: ObjectMetadataHealthService,
    private readonly fieldMetadataHealthService: FieldMetadataHealthService,
    private readonly relationMetadataHealthService: RelationMetadataHealthService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceFixService: WorkspaceFixService,
  ) {}

  async healthCheck(
    workspaceId: string,
    options: WorkspaceHealthOptions = { mode: WorkspaceHealthMode.All },
  ): Promise<WorkspaceHealthIssue[]> {
    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);
    const issues: WorkspaceHealthIssue[] = [];

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    // Check if a data source exists for this workspace
    if (!dataSourceMetadata) {
      throw new NotFoundException(
        `DataSource for workspace id ${workspaceId} not found`,
      );
    }

    // Try to connect to the data source
    await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const objectMetadataCollection =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // Check if object metadata exists for this workspace
    if (!objectMetadataCollection || objectMetadataCollection.length === 0) {
      throw new NotFoundException(`Workspace with id ${workspaceId} not found`);
    }

    for (const objectMetadata of objectMetadataCollection) {
      const tableName = computeObjectTargetTable(objectMetadata);
      const workspaceTableColumns =
        await this.databaseStructureService.getWorkspaceTableColumns(
          schemaName,
          tableName,
        );

      if (!workspaceTableColumns || workspaceTableColumns.length === 0) {
        throw new NotFoundException(
          `Table ${tableName} not found in schema ${schemaName}`,
        );
      }

      // Check object metadata health
      const objectIssues = await this.objectMetadataHealthService.healthCheck(
        schemaName,
        objectMetadata,
        options,
      );

      issues.push(...objectIssues);

      // Check fields metadata health
      const fieldIssues = await this.fieldMetadataHealthService.healthCheck(
        computeObjectTargetTable(objectMetadata),
        workspaceTableColumns,
        objectMetadata.fields,
        options,
      );

      issues.push(...fieldIssues);

      // Check relation metadata health
      const relationIssues = this.relationMetadataHealthService.healthCheck(
        workspaceTableColumns,
        objectMetadataCollection,
        objectMetadata,
        options,
      );

      issues.push(...relationIssues);
    }

    return issues;
  }

  async fixIssues(
    workspaceId: string,
    issues: WorkspaceHealthIssue[],
    options: {
      type: WorkspaceHealthFixKind;
      applyChanges?: boolean;
    },
  ): Promise<{
    workspaceMigrations: Partial<WorkspaceMigrationEntity>[];
    metadataEntities: unknown[];
  }> {
    let workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];
    let metadataEntities: unknown[] = [];

    // Set default options
    options.applyChanges ??= true;

    const queryRunner = this.metadataDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      const workspaceMigrationRepository = manager.getRepository(
        WorkspaceMigrationEntity,
      );
      const objectMetadataCollection =
        await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

      workspaceMigrations =
        await this.workspaceFixService.createWorkspaceMigrations(
          manager,
          objectMetadataCollection,
          options.type,
          issues,
        );

      metadataEntities = await this.workspaceFixService.createMetadataUpdates(
        manager,
        objectMetadataCollection,
        options.type,
        issues,
      );

      // Save workspace migrations into the database
      await workspaceMigrationRepository.save(workspaceMigrations);

      if (!options.applyChanges) {
        // Rollback transactions
        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        return {
          workspaceMigrations,
          metadataEntities,
        };
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Apply pending migrations
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Fix of issues failed with:', error);
    } finally {
      await queryRunner.release();
    }

    return {
      workspaceMigrations,
      metadataEntities,
    };
  }
}
