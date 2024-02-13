import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceMigrationBuilderAction } from 'src/workspace/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { WorkspaceMigrationFieldFactory } from 'src/workspace/workspace-migration-builder/factories/workspace-migration-field.factory';

type WorkspaceHealthNullableIssue =
  WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT>;

@Injectable()
export class WorkspaceFixNullableService {
  constructor(
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
  ) {}

  async fix(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthNullableIssue[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];
    const nullabilityIssues = issues.filter(
      (issue) =>
        issue.type === WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT,
    ) as WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT>[];

    if (nullabilityIssues.length > 0) {
      const columnNullabilityWorkspaceMigrations =
        await this.fixColumnNullabilityIssues(
          objectMetadataCollection,
          nullabilityIssues,
        );

      workspaceMigrations.push(...columnNullabilityWorkspaceMigrations);
    }

    return workspaceMigrations;
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
