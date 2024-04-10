import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  FieldMetadataUpdate,
  WorkspaceMigrationFieldFactory,
} from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';

import { AbstractWorkspaceFixer } from './abstract-workspace.fixer';

@Injectable()
export class WorkspaceMissingColumnFixer extends AbstractWorkspaceFixer<WorkspaceHealthIssueType.MISSING_COLUMN> {
  constructor(
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
  ) {
    super(WorkspaceHealthIssueType.MISSING_COLUMN);
  }

  async createWorkspaceMigrations(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.MISSING_COLUMN>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }

    return this.fixMissingColumnIssues(objectMetadataCollection, issues);
  }

  private async fixMissingColumnIssues(
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.MISSING_COLUMN>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const fieldMetadataUpdateCollection: FieldMetadataUpdate[] = [];

    for (const issue of issues) {
      if (!issue.columnStructures) {
        continue;
      }

      /**
       * Check if the column is prefixed with an underscore as it was the old convention
       */
      const oldColumnName = `_${issue.fieldMetadata.name}`;
      const oldColumnStructure = issue.columnStructures.find(
        (columnStructure) => columnStructure.columnName === oldColumnName,
      );

      if (!oldColumnStructure) {
        continue;
      }

      fieldMetadataUpdateCollection.push({
        current: {
          ...issue.fieldMetadata,
          name: oldColumnName,
        },
        altered: issue.fieldMetadata,
      });
    }

    if (fieldMetadataUpdateCollection.length <= 0) {
      return [];
    }

    return this.workspaceMigrationFieldFactory.create(
      objectMetadataCollection,
      fieldMetadataUpdateCollection,
      WorkspaceMigrationBuilderAction.UPDATE,
    );
  }
}
