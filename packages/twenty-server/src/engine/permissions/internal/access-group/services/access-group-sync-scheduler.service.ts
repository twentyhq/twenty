/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECOMPUTE_RECORD_ACCESS_GROUP_IDS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-record-access-group-ids-job-name.constant';
import { SYNC_ACCESS_GROUPS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/sync-access-groups-job-name.constant';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { type SyncAccessGroupsJobData } from 'src/engine/permissions/internal/access-group/types/sync-access-groups-job-data.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupSyncSchedulerService {
  constructor(
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async isEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return featureFlagsMap[FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED] ?? false;
  }

  async scheduleSyncIfEnabled(workspaceId: string): Promise<void> {
    await this.scheduleSyncJobIfEnabled({ workspaceId });
  }

  async scheduleSyncAndRelatedRecordPathTargetsRecomputeIfEnabled(
    workspaceId: string,
  ): Promise<void> {
    await this.scheduleSyncJobIfEnabled({
      workspaceId,
      isRecomputingRelatedRecordPathTargets: true,
    });
  }

  async scheduleRecordAccessGroupIdsRecompute({
    workspaceId,
    objectMetadataId,
    propagatedFromObjectMetadataIds = [],
  }: RecomputeRecordAccessGroupIdsJobData): Promise<void> {
    await this.messageQueueService.add<RecomputeRecordAccessGroupIdsJobData>(
      RECOMPUTE_RECORD_ACCESS_GROUP_IDS_JOB_NAME,
      { workspaceId, objectMetadataId, propagatedFromObjectMetadataIds },
      {
        isWorkspaceJob: true,
        workspaceId,
        retryLimit: 3,
        // One recompute per object and origin at a time, and at most one waiting behind it
        deduplication: {
          id: `record-access-group-ids:${workspaceId}:${objectMetadataId}${propagatedFromObjectMetadataIds.length > 0 ? ':propagated' : ''}`,
          keepLastIfActive: true,
        },
      },
    );
  }

  private async scheduleSyncJobIfEnabled(
    jobData: SyncAccessGroupsJobData,
  ): Promise<void> {
    if (!(await this.isEnabled(jobData.workspaceId))) {
      return;
    }

    await this.messageQueueService.add<SyncAccessGroupsJobData>(
      SYNC_ACCESS_GROUPS_JOB_NAME,
      jobData,
      {
        isWorkspaceJob: true,
        workspaceId: jobData.workspaceId,
        retryLimit: 3,
      },
    );
  }
}
