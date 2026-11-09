/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECOMPUTE_RECORD_ACCESS_GROUP_IDS_OF_RECORDS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-record-access-group-ids-of-records-job-name.constant';
import { RecordAccessGroupService } from 'src/engine/permissions/internal/access-group/services/record-access-group.service';
import { type RecomputeRecordAccessGroupIdsOfRecordsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-of-records-job-data.type';

@Processor(MessageQueue.accessGroupQueue)
export class RecomputeRecordAccessGroupIdsOfRecordsJob {
  constructor(
    private readonly recordAccessGroupService: RecordAccessGroupService,
  ) {}

  @Process(RECOMPUTE_RECORD_ACCESS_GROUP_IDS_OF_RECORDS_JOB_NAME)
  async handle(
    jobData: RecomputeRecordAccessGroupIdsOfRecordsJobData,
  ): Promise<void> {
    await this.recordAccessGroupService.recomputeRecordAccessGroupIdsOfRecords(
      jobData,
    );
  }
}
