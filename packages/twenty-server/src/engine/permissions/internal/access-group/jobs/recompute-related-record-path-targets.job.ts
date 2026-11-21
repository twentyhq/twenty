/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECOMPUTE_RELATED_RECORD_PATH_TARGETS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-related-record-path-targets-job-name.constant';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { type RecomputeRelatedRecordPathTargetsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-related-record-path-targets-job-data.type';

// TODO(@charlesBochet): remove after one release; forwards jobs queued before SyncAccessGroupsJob took over related record path changes
@Processor(MessageQueue.accessGroupQueue)
export class RecomputeRelatedRecordPathTargetsJob {
  constructor(
    private readonly accessGroupSyncSchedulerService: AccessGroupSyncSchedulerService,
  ) {}

  @Process(RECOMPUTE_RELATED_RECORD_PATH_TARGETS_JOB_NAME)
  async handle({
    workspaceId,
  }: RecomputeRelatedRecordPathTargetsJobData): Promise<void> {
    await this.accessGroupSyncSchedulerService.scheduleSyncIfEnabled({
      workspaceId,
      isRelatedRecordPathChanged: true,
    });
  }
}
