import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

// Phase A dual-write: mirror workspace `workflowVersion` writes into the core
// `WorkflowVersionEntity` (sharing the same id) so core stays populated before
// reads switch in Phase B. Gated by IS_WORKFLOW_VERSION_IN_CORE_ENABLED and
// removed in Phase C once the workspace columns are dropped.
@Injectable()
export class WorkflowVersionCoreSyncListener {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.CREATED)
  async handleCreated(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.mirror(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.UPDATED)
  async handleUpdated(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.mirror(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.DELETED)
  async handleDeleted(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordDeleteEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId) || !(await this.isEnabled(workspaceId))) {
      return;
    }

    const ids = batchEvent.events
      .map((event) => event.properties.before?.id)
      .filter(isDefined);

    if (ids.length === 0) {
      return;
    }

    await this.coreWorkflowVersionRepository.softDelete(workspaceId, {
      id: In(ids),
    });
    await this.flushCache(workspaceId);
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.DESTROYED)
  async handleDestroyed(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordDestroyEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId) || !(await this.isEnabled(workspaceId))) {
      return;
    }

    const ids = batchEvent.events
      .map((event) => event.properties.before?.id)
      .filter(isDefined);

    if (ids.length === 0) {
      return;
    }

    await this.coreWorkflowVersionRepository.delete(workspaceId, {
      id: In(ids),
    });
    await this.flushCache(workspaceId);
  }

  private async mirror(
    workspaceId: string | undefined,
    records: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    if (!isDefined(workspaceId) || !(await this.isEnabled(workspaceId))) {
      return;
    }

    const entities = records
      .filter((record) => isDefined(record?.id))
      .map((record) => ({
        id: record.id,
        workflowId: record.workflowId,
        name: record.name ?? null,
        status: record.status as unknown as CoreWorkflowVersionStatus,
        position: record.position ?? 0,
        trigger: record.trigger ?? null,
        steps: record.steps ?? null,
        // Active records have deletedAt null; setting it explicitly also
        // restores a previously soft-deleted core row.
        deletedAt: isDefined(record.deletedAt)
          ? new Date(record.deletedAt)
          : null,
      }));

    if (entities.length === 0) {
      return;
    }

    await this.coreWorkflowVersionRepository.upsert(workspaceId, entities, [
      'id',
    ]);
    await this.flushCache(workspaceId);
  }

  private async isEnabled(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED,
      workspaceId,
    );
  }

  private async flushCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.flush(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
