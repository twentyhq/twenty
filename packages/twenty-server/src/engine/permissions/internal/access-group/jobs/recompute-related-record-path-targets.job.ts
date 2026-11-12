/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECOMPUTE_RELATED_RECORD_PATH_TARGETS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-related-record-path-targets-job-name.constant';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { type RecomputeRelatedRecordPathTargetsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-related-record-path-targets-job-data.type';
import { AccessGroupPropagationProgressService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-progress.service';

@Processor(MessageQueue.accessGroupQueue)
export class RecomputeRelatedRecordPathTargetsJob {
  constructor(
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
    private readonly accessGroupPropagationProgressService: AccessGroupPropagationProgressService,
  ) {}

  @Process(RECOMPUTE_RELATED_RECORD_PATH_TARGETS_JOB_NAME)
  async handle(
    jobData: RecomputeRelatedRecordPathTargetsJobData,
  ): Promise<void> {
    try {
      await this.recordAccessGroupPropagationService.scheduleRecomputeOfRelatedRecordPathTargets(
        jobData,
      );
    } finally {
      // Also on an attempt that will be retried: the retry runs uncounted rather than a failed job staying pending
      await this.accessGroupPropagationProgressService.removePendingSync(
        jobData.workspaceId,
      );
    }
  }
}
