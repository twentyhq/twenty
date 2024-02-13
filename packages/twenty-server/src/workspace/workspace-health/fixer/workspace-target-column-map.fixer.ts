import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';
import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';

import {
  AbstractWorkspaceFixer,
  CompareEntity,
} from './abstract-workspace.fixer';

@Injectable()
export class WorkspaceTargetColumnMapFixer extends AbstractWorkspaceFixer<
  WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
  FieldMetadataEntity
> {
  constructor() {
    super(WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID);
  }

  async createMetadataUpdates(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>[],
  ): Promise<CompareEntity<FieldMetadataEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }

    return this.fixTargetColumnMapIssues(manager, issues);
  }

  private async fixTargetColumnMapIssues(
    manager: EntityManager,
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>[],
  ): Promise<CompareEntity<FieldMetadataEntity>[]> {
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);
    const updatedEntities: CompareEntity<FieldMetadataEntity>[] = [];

    for (const issue of issues) {
      await fieldMetadataRepository.update(issue.fieldMetadata.id, {
        targetColumnMap: generateTargetColumnMap(
          issue.fieldMetadata.type,
          issue.fieldMetadata.isCustom,
          issue.fieldMetadata.name,
        ),
      });
      const alteredEntity = await fieldMetadataRepository.findOne({
        where: {
          id: issue.fieldMetadata.id,
        },
      });

      updatedEntities.push({
        current: issue.fieldMetadata,
        altered: alteredEntity as FieldMetadataEntity | null,
      });
    }

    return updatedEntities;
  }
}
