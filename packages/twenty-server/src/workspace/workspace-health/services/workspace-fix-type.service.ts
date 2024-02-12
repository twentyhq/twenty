import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceMigrationBuilderAction } from 'src/workspace/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFieldFactory } from 'src/workspace/workspace-migration-builder/factories/workspace-migration-field.factory';

import { DatabaseStructureService } from './database-structure.service';

type WorkspaceHealthTypeIssue =
  WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT>;

@Injectable()
export class WorkspaceFixTypeService {
  constructor(
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
    private readonly databaseStructureService: DatabaseStructureService,
  ) {}

  async fix(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthTypeIssue[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];
    const columnTypeIssues = issues.filter(
      (issue) =>
        issue.type === WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT,
    ) as WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT>[];

    if (columnTypeIssues.length > 0) {
      const columnNullabilityWorkspaceMigrations =
        await this.fixColumnTypeIssues(
          objectMetadataCollection,
          columnTypeIssues,
        );

      workspaceMigrations.push(...columnNullabilityWorkspaceMigrations);
    }

    return workspaceMigrations;
  }

  private async fixColumnTypeIssues(
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const fieldMetadataUpdateCollection = issues.map((issue) => {
      if (!issue.columnStructure?.dataType) {
        throw new Error('Column structure data type is missing');
      }

      const type =
        this.databaseStructureService.getFieldMetadataTypeFromPostgresDataType(
          issue.columnStructure?.dataType,
        );

      if (!type) {
        throw new Error("Can't find field metadata type from column structure");
      }

      return {
        current: {
          ...issue.fieldMetadata,
          type,
        },
        altered: issue.fieldMetadata,
      };
    });

    return this.workspaceMigrationFieldFactory.create(
      objectMetadataCollection,
      fieldMetadataUpdateCollection,
      WorkspaceMigrationBuilderAction.UPDATE,
    );
  }
}
