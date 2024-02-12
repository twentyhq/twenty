import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';

type WorkspaceHealthTargetColumnMapIssue =
  WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>;

@Injectable()
export class WorkspaceFixTargetColumnMapService {
  constructor() {}

  async fix(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthTargetColumnMapIssue[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const targetColumnMapIssues = issues.filter(
      (issue) =>
        issue.type ===
        WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
    );

    if (targetColumnMapIssues.length > 0) {
      await this.fixColumnTargetColumnMapIssues(manager, targetColumnMapIssues);
    }

    return [];
  }

  private async fixColumnTargetColumnMapIssues(
    manager: EntityManager,
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>[],
  ): Promise<void> {
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);

    for (const issue of issues) {
      await fieldMetadataRepository.update(issue.fieldMetadata.id, {
        targetColumnMap: generateTargetColumnMap(
          issue.fieldMetadata.type,
          issue.fieldMetadata.isCustom,
          issue.fieldMetadata.name,
        ),
      });
    }
  }
}
