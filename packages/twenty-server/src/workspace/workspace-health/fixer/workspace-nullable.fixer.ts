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

import { AbstractWorkspaceFixer } from './abstract-workspace.fixer';

@Injectable()
export class WorkspaceNullableFixer extends AbstractWorkspaceFixer<WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT> {
  constructor(
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
  ) {
    super(WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT);
  }

  async createWorkspaceMigrations(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }

    return this.fixColumnNullabilityIssues(objectMetadataCollection, issues);
  }

  private async fixColumnNullabilityIssues(
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const fieldMetadataUpdateCollection = issues.map((issue) => {
      return {
        current: {
          ...issue.fieldMetadata,
          isNullable: issue.columnStructure?.isNullable ?? false,
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
