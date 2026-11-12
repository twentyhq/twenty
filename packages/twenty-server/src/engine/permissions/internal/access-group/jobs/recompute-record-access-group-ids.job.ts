/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECOMPUTE_RECORD_ACCESS_GROUP_IDS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-record-access-group-ids-job-name.constant';
import { AccessGroupPropagationProgressService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-progress.service';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';

@Processor(MessageQueue.accessGroupQueue)
export class RecomputeRecordAccessGroupIdsJob {
  constructor(
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
    private readonly accessGroupPropagationProgressService: AccessGroupPropagationProgressService,
  ) {}

  @Process(RECOMPUTE_RECORD_ACCESS_GROUP_IDS_JOB_NAME)
  async handle(jobData: RecomputeRecordAccessGroupIdsJobData): Promise<void> {
    try {
      await this.recordAccessGroupPropagationService.recomputeRecordAccessGroupIdsOfAllObjectRecordsAndPropagate(
        jobData,
      );
    } catch (error) {
      // A retry counts the object again when it starts
      await this.accessGroupPropagationProgressService.abandonObjectRecompute(
        jobData,
      );

      throw error;
    }
  }
}
