import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ChannelVisibilityRuleSyncSchedulerService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync-scheduler.service';
import { OnCustomBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-custom-batch-event.decorator';
import { OnDatabaseBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { FEATURE_FLAG_DISABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-disabled-event.constant';
import { FEATURE_FLAG_ENABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-enabled-event.constant';
import { type FeatureFlagEnabledEvent } from 'src/engine/core-modules/feature-flag/types/feature-flag-enabled-event.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const API_KEYS_INDIVIDUAL_ROLE_SOURCE_PROPERTIES = [
  'canBeAssignedToUsers',
  'canBeAssignedToApiKeys',
  'canReadAllObjectRecords',
  'canCreateAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
];

const isAssignableToUsers = (role: object): boolean =>
  'canBeAssignedToUsers' in role && role.canBeAssignedToUsers === true;

const isApiKeysIndividualRoleSourceChanged = (
  event: MetadataEvent,
): boolean => {
  switch (event.type) {
    case 'created':
      return isAssignableToUsers(event.properties.after);
    case 'updated':
      return API_KEYS_INDIVIDUAL_ROLE_SOURCE_PROPERTIES.some(
        (property) => property in event.properties.diff,
      );
    case 'deleted':
      return isAssignableToUsers(event.properties.before);
  }
};

@Injectable()
export class ChannelVisibilityRuleSyncListener {
  constructor(
    private readonly channelVisibilityRuleSyncSchedulerService: ChannelVisibilityRuleSyncSchedulerService,
  ) {}

  @OnCustomBatchEvent(FEATURE_FLAG_ENABLED_EVENT)
  @OnCustomBatchEvent(FEATURE_FLAG_DISABLED_EVENT)
  async handleFeatureFlagToggled({
    workspaceId,
    events,
  }: Pick<
    CustomWorkspaceEventBatch<FeatureFlagEnabledEvent>,
    'workspaceId' | 'events'
  >): Promise<void> {
    if (
      isDefined(workspaceId) &&
      events.some(({ key }) =>
        [
          FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
          FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_API_KEYS,
          FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
          FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
        ].includes(key),
      )
    ) {
      await this.channelVisibilityRuleSyncSchedulerService.scheduleSync(
        workspaceId,
      );
    }
  }

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.RESTORED)
  async handleWorkspaceMemberChanged({
    workspaceId,
  }: Pick<WorkspaceEventBatch<never>, 'workspaceId'>): Promise<void> {
    await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
      workspaceId,
    );
  }

  @OnEvent('metadata.role.created')
  @OnEvent('metadata.role.updated')
  @OnEvent('metadata.role.deleted')
  async handleRoleChanged({
    workspaceId,
    events,
  }: MetadataEventBatch<'role'>): Promise<void> {
    if (events.some(isApiKeysIndividualRoleSourceChanged)) {
      await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
        workspaceId,
      );
    }
  }
}
