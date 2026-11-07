/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECOMPUTE_ACCESS_GROUP_IDS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-access-group-ids-job-name.constant';
import { AccessGroupRecordService } from 'src/engine/permissions/internal/access-group/services/access-group-record.service';
import { type RecomputeAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-access-group-ids-job-data.type';

@Processor(MessageQueue.accessGroupQueue)
export class RecomputeAccessGroupIdsJob {
  constructor(
    private readonly accessGroupRecordService: AccessGroupRecordService,
  ) {}

  @Process(RECOMPUTE_ACCESS_GROUP_IDS_JOB_NAME)
  async handle(jobData: RecomputeAccessGroupIdsJobData): Promise<void> {
    await this.accessGroupRecordService.recomputeAccessGroupIds(jobData);
  }
}
