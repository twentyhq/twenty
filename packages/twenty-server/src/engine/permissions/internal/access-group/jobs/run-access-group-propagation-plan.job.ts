/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RUN_ACCESS_GROUP_PROPAGATION_PLAN_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/run-access-group-propagation-plan-job-name.constant';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { type RunAccessGroupPropagationPlanJobData } from 'src/engine/permissions/internal/access-group/types/run-access-group-propagation-plan-job-data.type';

@Processor(MessageQueue.accessGroupQueue)
export class RunAccessGroupPropagationPlanJob {
  constructor(
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
  ) {}

  @Process(RUN_ACCESS_GROUP_PROPAGATION_PLAN_JOB_NAME)
  async handle({
    workspaceId,
  }: RunAccessGroupPropagationPlanJobData): Promise<void> {
    await this.recordAccessGroupPropagationService.computeNextPlannedObject(
      workspaceId,
    );
  }
}
