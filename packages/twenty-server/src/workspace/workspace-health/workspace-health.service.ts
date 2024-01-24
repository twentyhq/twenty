import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkspaceHealthIssue } from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';
import {
  WorkspaceHealthMode,
  WorkspaceHealthOptions,
} from 'src/workspace/workspace-health/interfaces/workspace-health-options.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectMetadataHealthService } from 'src/workspace/workspace-health/services/object-metadata-health.service';
import { FieldMetadataHealthService } from 'src/workspace/workspace-health/services/field-metadata-health.service';
import { RelationMetadataHealthService } from 'src/workspace/workspace-health/services/relation-metadata.health.service';
import { DatabaseStructureService } from 'src/workspace/workspace-health/services/database-structure.service';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';

@Injectable()
export class WorkspaceHealthService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly databaseStructureService: DatabaseStructureService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataHealthService: ObjectMetadataHealthService,
    private readonly fieldMetadataHealthService: FieldMetadataHealthService,
    private readonly relationMetadataHealthService: RelationMetadataHealthService,
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
}
