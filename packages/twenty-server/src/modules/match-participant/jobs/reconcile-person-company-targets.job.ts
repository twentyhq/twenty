import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';

export type ReconcilePersonCompanyTargetsJobData = {
  workspaceId: string;
  personIds: string[];
};

@Processor({ queueName: MessageQueue.messagingQueue, scope: Scope.REQUEST })
export class ReconcilePersonCompanyTargetsJob {
  constructor(
    private readonly participantTargetReconciliationService: ParticipantTargetReconciliationService,
  ) {}

  @Process(ReconcilePersonCompanyTargetsJob.name)
  async handle(data: ReconcilePersonCompanyTargetsJobData): Promise<void> {
    await this.participantTargetReconciliationService.reconcileTargetsForPeople(
      data,
    );
  }
}
