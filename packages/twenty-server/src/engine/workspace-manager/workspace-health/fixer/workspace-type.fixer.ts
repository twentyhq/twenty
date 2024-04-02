import { Injectable, Logger } from '@nestjs/common';

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
import { DatabaseStructureService } from 'src/engine/workspace-manager/workspace-health/services/database-structure.service';

import { AbstractWorkspaceFixer } from './abstract-workspace.fixer';

const oldDataTypes = ['integer'];

@Injectable()
export class WorkspaceTypeFixer extends AbstractWorkspaceFixer<WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT> {
  private readonly logger = new Logger(WorkspaceTypeFixer.name);

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
    const fieldMetadataUpdateCollection: FieldMetadataUpdate[] = [];

    for (const issue of issues) {
      const dataType = issue.columnStructure?.dataType;

      if (!dataType) {
        throw new Error('Column structure data type is missing');
      }

      const type =
        this.databaseStructureService.getFieldMetadataTypeFromPostgresDataType(
          dataType,
        );

      if (oldDataTypes.includes(dataType)) {
        this.logger.warn(
          `Old data type detected for column ${issue.columnStructure?.columnName} with data type ${dataType}. Please update the column data type manually.`,
        );
        continue;
      }

      if (!type) {
        throw new Error("Can't find field metadata type from column structure");
      }

      fieldMetadataUpdateCollection.push({
        current: {
          ...issue.fieldMetadata,
          type,
        },
        altered: issue.fieldMetadata,
      });
    }

    return this.workspaceMigrationFieldFactory.create(
      objectMetadataCollection,
      fieldMetadataUpdateCollection,
      WorkspaceMigrationBuilderAction.UPDATE,
    );
  }
}
