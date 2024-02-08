import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceHealthFixKind } from 'src/workspace/workspace-health/interfaces/workspace-health-fix-kind.interface';
import { WorkspaceHealthIssue } from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { isWorkspaceHealthNullableIssue } from 'src/workspace/workspace-health/utils/is-workspace-health-issue-type.util';

import { WorkspaceFixNullableService } from './workspace-fix-nullable.service';

@Injectable()
export class WorkspaceFixService {
  constructor(
    private readonly workspaceFixNullableService: WorkspaceFixNullableService,
  ) {}

  async fix(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    type: WorkspaceHealthFixKind,
    issues: WorkspaceHealthIssue[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const services = {
      [WorkspaceHealthFixKind.Nullable]: {
        service: this.workspaceFixNullableService,
        issues: issues.filter((issue) =>
          isWorkspaceHealthNullableIssue(issue.type),
        ),
      },
    };

    return services[type].service.fix(
      manager,
      objectMetadataCollection,
      services[type].issues,
    );
  }
}
