/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { APPLY_ACCESS_GROUP_PROPAGATION_PLAN_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/apply-access-group-propagation-plan-job-name.constant';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { type ApplyAccessGroupPropagationPlanJobData } from 'src/engine/permissions/internal/access-group/types/apply-access-group-propagation-plan-job-data.type';

@Processor(MessageQueue.accessGroupQueue)
export class ApplyAccessGroupPropagationPlanJob {
  constructor(
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
  ) {}

  @Process(APPLY_ACCESS_GROUP_PROPAGATION_PLAN_JOB_NAME)
  async handle(
    applyJobData: ApplyAccessGroupPropagationPlanJobData,
  ): Promise<void> {
    await this.recordAccessGroupPropagationService.computeNextPlannedObject(
      applyJobData,
    );
  }
}
