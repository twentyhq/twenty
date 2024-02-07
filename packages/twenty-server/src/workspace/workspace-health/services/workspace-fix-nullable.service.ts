import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
  WorkspaceHealthRelationIssue,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

type WorkspaceHealthNullableIssue =
  | WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT>
  | WorkspaceHealthRelationIssue<WorkspaceHealthIssueType.RELATION_NULLABILITY_CONFLICT>;

@Injectable()
export class WorkspaceFixNullableService {
  constructor() {}

  async fix(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    manager: EntityManager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    objectMetadataCollection: ObjectMetadataEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    issues: WorkspaceHealthNullableIssue[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    // TODO: Implement nullable fix
    return [];
  }
}
