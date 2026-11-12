/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { APPLY_ACCESS_GROUP_PROPAGATION_PLAN_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/apply-access-group-propagation-plan-job-name.constant';
import { RECOMPUTE_RELATED_RECORD_PATH_TARGETS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-related-record-path-targets-job-name.constant';
import { SYNC_ACCESS_GROUPS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/sync-access-groups-job-name.constant';
import { type ApplyAccessGroupPropagationPlanJobData } from 'src/engine/permissions/internal/access-group/types/apply-access-group-propagation-plan-job-data.type';
import { type RecomputeRelatedRecordPathTargetsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-related-record-path-targets-job-data.type';
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
    await this.scheduleWorkspaceJobIfEnabled({
      workspaceId,
      jobName: SYNC_ACCESS_GROUPS_JOB_NAME,
    });
  }

  async scheduleRelatedRecordPathTargetsRecomputeIfEnabled(
    workspaceId: string,
  ): Promise<void> {
    await this.scheduleWorkspaceJobIfEnabled({
      workspaceId,
      jobName: RECOMPUTE_RELATED_RECORD_PATH_TARGETS_JOB_NAME,
    });
  }

  async enqueueApplyAccessGroupPropagationPlanJob(
    applyJobData: ApplyAccessGroupPropagationPlanJobData,
  ): Promise<void> {
    const { workspaceId } = applyJobData;

    await this.messageQueueService.add<ApplyAccessGroupPropagationPlanJobData>(
      APPLY_ACCESS_GROUP_PROPAGATION_PLAN_JOB_NAME,
      applyJobData,
      {
        isWorkspaceJob: true,
        workspaceId,
        deduplication: {
          id: `access-group-propagation-plan:${workspaceId}`,
          keepLastIfActive: true,
        },
      },
    );
  }

  private async scheduleWorkspaceJobIfEnabled({
    workspaceId,
    jobName,
  }: {
    workspaceId: string;
    jobName: string;
  }): Promise<void> {
    if (!(await this.isEnabled(workspaceId))) {
      return;
    }

    await this.messageQueueService.add<
      SyncAccessGroupsJobData | RecomputeRelatedRecordPathTargetsJobData
    >(
      jobName,
      { workspaceId },
      { isWorkspaceJob: true, workspaceId, retryLimit: 3 },
    );
  }
}
