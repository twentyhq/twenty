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
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME } from 'src/engine/permissions/channel-visibility/constants/sync-channel-visibility-rules-job-name.constant';
import { type SyncChannelVisibilityRulesJobData } from 'src/engine/permissions/channel-visibility/types/sync-channel-visibility-rules-job-data.type';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type ChannelVisibilitySourceChangedEvent } from 'src/engine/permissions/channel-visibility/types/channel-visibility-source-changed-event.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class ChannelVisibilityRuleSyncListener {
  constructor(
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      await this.scheduleSync(workspaceId);
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
      await this.scheduleSyncIfEnabled(workspaceId);
    }
  }

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.RESTORED)
  async handleWorkspaceMemberChanged({
    workspaceId,
  }: Pick<WorkspaceEventBatch<never>, 'workspaceId'>): Promise<void> {
    await this.scheduleSyncIfEnabled(workspaceId);
  }

  private async scheduleSyncIfEnabled(workspaceId: string): Promise<void> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (isChannelVisibilityRlsEnabled(featureFlagsMap)) {
      await this.scheduleSync(workspaceId);
    }
  }

  private async scheduleSync(workspaceId: string): Promise<void> {
    await this.messageQueueService.add<SyncChannelVisibilityRulesJobData>(
      SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME,
      { workspaceId },
      { isWorkspaceJob: true, workspaceId, retryLimit: 3 },
    );
  }
}
