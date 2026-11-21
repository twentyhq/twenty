import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-custom-batch-event.decorator';
import { OnDatabaseBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { FEATURE_FLAG_DISABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-disabled-event.constant';
import { FEATURE_FLAG_ENABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-enabled-event.constant';
import { type FeatureFlagEnabledEvent } from 'src/engine/core-modules/feature-flag/types/feature-flag-enabled-event.type';
import { CHANNEL_VISIBILITY_SOURCE_CHANGED_EVENT } from 'src/engine/permissions/channel-visibility/constants/channel-visibility-source-changed-event.constant';
import { ChannelVisibilityRuleSyncSchedulerService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync-scheduler.service';
import { type ChannelVisibilitySourceChangedEvent } from 'src/engine/permissions/channel-visibility/types/channel-visibility-source-changed-event.type';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class ChannelVisibilityRuleSyncListener {
  constructor(
    private readonly channelVisibilityRuleSyncSchedulerService: ChannelVisibilityRuleSyncSchedulerService,
  ) {}

  // the sync also tears the rules down once the flag is off
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
          FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
        ].includes(key),
      )
    ) {
      await this.channelVisibilityRuleSyncSchedulerService.scheduleSync(
        workspaceId,
      );
    }
  }

  @OnCustomBatchEvent(CHANNEL_VISIBILITY_SOURCE_CHANGED_EVENT)
  async handleChannelVisibilitySourceChanged({
    workspaceId,
  }: Pick<
    CustomWorkspaceEventBatch<ChannelVisibilitySourceChangedEvent>,
    'workspaceId'
  >): Promise<void> {
    if (isDefined(workspaceId)) {
      await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
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
  }: {
    workspaceId: string;
  }): Promise<void> {
    await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
      workspaceId,
    );
  }
}
