import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceHealthFixKind } from 'src/workspace/workspace-health/interfaces/workspace-health-fix-kind.interface';
import { WorkspaceHealthIssue } from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { WorkspaceNullableFixer } from 'src/workspace/workspace-health/fixer/workspace-nullable.fixer';
import { WorkspaceDefaultValueFixer } from 'src/workspace/workspace-health/fixer/workspace-default-value.fixer';
import { WorkspaceTypeFixer } from 'src/workspace/workspace-health/fixer/workspace-type.fixer';
import { WorkspaceTargetColumnMapFixer } from 'src/workspace/workspace-health/fixer/workspace-target-column-map.fixer';
import { CompareEntity } from 'src/workspace/workspace-health/fixer/abstract-workspace.fixer';

@Injectable()
export class WorkspaceFixService {
  constructor(
    private readonly workspaceNullableFixer: WorkspaceNullableFixer,
    private readonly workspaceDefaultValueFixer: WorkspaceDefaultValueFixer,
    private readonly workspaceTypeFixer: WorkspaceTypeFixer,
    private readonly workspaceTargetColumnMapFixer: WorkspaceTargetColumnMapFixer,
  ) {}

  async createWorkspaceMigrations(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    type: WorkspaceHealthFixKind,
    issues: WorkspaceHealthIssue[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    switch (type) {
      case WorkspaceHealthFixKind.Nullable: {
        const filteredIssues = this.workspaceNullableFixer.filterIssues(issues);

        return this.workspaceNullableFixer.createWorkspaceMigrations(
          manager,
          objectMetadataCollection,
          filteredIssues,
        );
      }
      case WorkspaceHealthFixKind.DefaultValue: {
        const filteredIssues =
          this.workspaceDefaultValueFixer.filterIssues(issues);

        return this.workspaceDefaultValueFixer.createWorkspaceMigrations(
          manager,
          objectMetadataCollection,
          filteredIssues,
        );
      }
      case WorkspaceHealthFixKind.Type: {
        const filteredIssues = this.workspaceTypeFixer.filterIssues(issues);

        return this.workspaceTypeFixer.createWorkspaceMigrations(
          manager,
          objectMetadataCollection,
          filteredIssues,
        );
      }
      case WorkspaceHealthFixKind.TargetColumnMap: {
        const filteredIssues =
          this.workspaceTargetColumnMapFixer.filterIssues(issues);

        return this.workspaceTargetColumnMapFixer.createWorkspaceMigrations(
          manager,
          objectMetadataCollection,
          filteredIssues,
        );
      }
      default: {
        return [];
      }
    }
  }

  async createMetadataUpdates(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    type: WorkspaceHealthFixKind,
    issues: WorkspaceHealthIssue[],
  ): Promise<CompareEntity<unknown>[]> {
    switch (type) {
      case WorkspaceHealthFixKind.TargetColumnMap: {
        const filteredIssues =
          this.workspaceTargetColumnMapFixer.filterIssues(issues);

        return this.workspaceTargetColumnMapFixer.createMetadataUpdates(
          manager,
          objectMetadataCollection,
          filteredIssues,
        );
      }
      default: {
        return [];
      }
    }
  }
}
