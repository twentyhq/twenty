import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceHealthFixKind } from 'src/workspace/workspace-health/interfaces/workspace-health-fix-kind.interface';
import { WorkspaceHealthIssue } from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  isWorkspaceHealthDefaultValueIssue,
  isWorkspaceHealthNullableIssue,
  isWorkspaceHealthTargetColumnMapIssue,
  isWorkspaceHealthTypeIssue,
} from 'src/workspace/workspace-health/utils/is-workspace-health-issue-type.util';

import { WorkspaceFixNullableService } from './workspace-fix-nullable.service';
import { WorkspaceFixTypeService } from './workspace-fix-type.service';
import { WorkspaceFixDefaultValueService } from './workspace-fix-default-value.service';
import { WorkspaceFixTargetColumnMapService } from './workspace-fix-target-column-map.service';

@Injectable()
export class WorkspaceFixService {
  constructor(
    private readonly workspaceFixNullableService: WorkspaceFixNullableService,
    private readonly workspaceFixTypeService: WorkspaceFixTypeService,
    private readonly workspaceFixDefaultValueService: WorkspaceFixDefaultValueService,
    private readonly workspaceFixTargetColumnMapService: WorkspaceFixTargetColumnMapService,
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
      [WorkspaceHealthFixKind.Type]: {
        service: this.workspaceFixTypeService,
        issues: issues.filter((issue) =>
          isWorkspaceHealthTypeIssue(issue.type),
        ),
      },
      [WorkspaceHealthFixKind.DefaultValue]: {
        service: this.workspaceFixDefaultValueService,
        issues: issues.filter((issue) =>
          isWorkspaceHealthDefaultValueIssue(issue.type),
        ),
      },
      [WorkspaceHealthFixKind.TargetColumnMap]: {
        service: this.workspaceFixTargetColumnMapService,
        issues: issues.filter((issue) =>
          isWorkspaceHealthTargetColumnMapIssue(issue.type),
        ),
      },
    };

    return services[type].service.fix(
      manager,
      objectMetadataCollection,
      // TODO: Refactor all of the issues filtering
      services[type].issues as any[],
    );
  }
}
