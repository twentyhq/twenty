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
import { DatabaseStructureService } from 'src/workspace/workspace-health/services/database-structure.service';

import { AbstractWorkspaceFixer } from './abstract-workspace.fixer';

@Injectable()
export class WorkspaceTypeFixer extends AbstractWorkspaceFixer<WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT> {
  constructor(
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
    private readonly databaseStructureService: DatabaseStructureService,
  ) {
    super(WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT);
  }

  async createWorkspaceMigrations(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }

    return this.fixColumnTypeIssues(objectMetadataCollection, issues);
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
