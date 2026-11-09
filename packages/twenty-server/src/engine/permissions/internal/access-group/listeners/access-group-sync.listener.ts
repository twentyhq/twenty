/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FEATURE_FLAG_DISABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-disabled-event.constant';
import { FEATURE_FLAG_ENABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-enabled-event.constant';
import { type FeatureFlagEnabledEvent } from 'src/engine/core-modules/feature-flag/types/feature-flag-enabled-event.type';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { isWorkspaceMemberUpdateAffectingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-workspace-member-update-affecting-access-groups.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';

const FLAGS_AFFECTING_ACCESS_GROUPS = [
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
];

@Injectable()
export class AccessGroupSyncListener {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupSyncSchedulerService: AccessGroupSyncSchedulerService,
  ) {}

  @OnEvent('metadata.role.*')
  @OnEvent('metadata.roleTarget.*')
  @OnEvent('metadata.objectPermission.*')
  @OnEvent('metadata.objectMetadata.*')
  @OnEvent('metadata.rowLevelPermissionPredicate.*')
  @OnEvent('metadata.rowLevelPermissionPredicateGroup.*')
  async handleMetadataEvent({
    workspaceId,
  }: Pick<MetadataEventBatch, 'workspaceId'>): Promise<void> {
    await this.accessGroupSyncSchedulerService.scheduleSyncIfEnabled(
      workspaceId,
    );
  }

  @OnCustomBatchEvent(FEATURE_FLAG_ENABLED_EVENT)
  async handleFeatureFlagEnabled(
    batch: Pick<
      CustomWorkspaceEventBatch<FeatureFlagEnabledEvent>,
      'workspaceId' | 'events'
    >,
  ): Promise<void> {
    await this.scheduleSyncForFlagChange(batch);
  }

  @OnCustomBatchEvent(FEATURE_FLAG_DISABLED_EVENT)
  async handleFeatureFlagDisabled(
    batch: Pick<
      CustomWorkspaceEventBatch<FeatureFlagEnabledEvent>,
      'workspaceId' | 'events'
    >,
  ): Promise<void> {
    await this.scheduleSyncForFlagChange(batch);
  }

  private async scheduleSyncForFlagChange({
    workspaceId,
    events,
  }: Pick<
    CustomWorkspaceEventBatch<FeatureFlagEnabledEvent>,
    'workspaceId' | 'events'
  >): Promise<void> {
    if (
      isDefined(workspaceId) &&
      events.some(({ key }) => FLAGS_AFFECTING_ACCESS_GROUPS.includes(key))
    ) {
      await this.accessGroupSyncSchedulerService.scheduleSyncIfEnabled(
        workspaceId,
      );
    }
  }

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.UPDATED)
  async handleWorkspaceMemberUpdated({
    workspaceId,
    events,
  }: Pick<
    WorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
    >,
    'workspaceId' | 'events'
  >): Promise<void> {
    if (!(await this.accessGroupSyncSchedulerService.isEnabled(workspaceId))) {
      return;
    }

    const { flatRowLevelPermissionPredicateMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRowLevelPermissionPredicateMaps',
        'flatFieldMetadataMaps',
      ]);

    if (
      isWorkspaceMemberUpdateAffectingAccessGroups({
        updatedFields: events.flatMap(
          ({ properties }) => properties.updatedFields,
        ),
        flatRowLevelPermissionPredicateMaps,
        flatFieldMetadataMaps,
      })
    ) {
      await this.refreshMembersAndScheduleSync(workspaceId);
    }
  }

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.RESTORED)
  async handleWorkspaceMemberEvent({
    workspaceId,
  }: Pick<WorkspaceEventBatch<never>, 'workspaceId'>): Promise<void> {
    if (await this.accessGroupSyncSchedulerService.isEnabled(workspaceId)) {
      await this.refreshMembersAndScheduleSync(workspaceId);
    }
  }

  private async refreshMembersAndScheduleSync(
    workspaceId: string,
  ): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
    ]);

    await this.accessGroupSyncSchedulerService.scheduleSyncIfEnabled(
      workspaceId,
    );
  }
}
