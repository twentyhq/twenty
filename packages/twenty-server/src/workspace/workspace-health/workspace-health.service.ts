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

@Injectable()
export class WorkspaceHealthService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataHealthService: ObjectMetadataHealthService,
    private readonly fieldMetadataHealthService: FieldMetadataHealthService,
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
        `Datasource for workspace id ${workspaceId} not found`,
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
      // Check object metadata health
      const objectIssues = await this.objectMetadataHealthService.healthCheck(
        schemaName,
        objectMetadata,
        options,
      );

      issues.push(...objectIssues);

      // Check fields metadata health
      const fieldIssues = await this.fieldMetadataHealthService.healthCheck(
        schemaName,
        objectMetadata.targetTableName,
        objectMetadata.fields,
        options,
      );

      issues.push(...fieldIssues);
    }

    return issues;
  }
}
