// packages/twenty-server/src/engine/core-modules/billing/crons/jobs/check-inter-payment-expiration.job.ts
import { Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  ChageEmmitBillJob,
  ChargeEmmitBillJob,
} from 'src/modules/charges/jobs/charge-emmit-bill.job';
import { ChargeService } from 'src/modules/charges/services/charge.service';
import { ChargeRecurrence } from 'src/modules/charges/standard-objects/charge.workspace-entity';

// '0 0 1 1 *'
export const CHARGE_EMMIT_YEARLY_BILL_CRON_PATTERN = '*/5 * * * *'; // Run every year on day 1 ad midnight

@Processor(MessageQueue.cronQueue)
export class ChargeEmmitYearlyBillCronJob {
  private readonly logger = new Logger(ChargeEmmitYearlyBillCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.chargeQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly chargeService: ChargeService,
  ) {}

  @Process(ChargeEmmitYearlyBillCronJob.name)
  @SentryCronMonitor(
    ChargeEmmitYearlyBillCronJob.name,
    CHARGE_EMMIT_YEARLY_BILL_CRON_PATTERN,
  )
  async handle() {
    this.logger.warn(`Checking yearly charges to emmit`);

    const workspaceYearlyChargesMap =
      await this.chargeService.getWorkspaceChargesMapByRecurrence(
        ChargeRecurrence.ANNUAL,
      );

    const workspaceYearlyChargesMapList = Object.entries(
      workspaceYearlyChargesMap,
    );

    if (workspaceYearlyChargesMapList.length === 0) {
      this.logger.warn(`No yearly charges found to emmit`);

      return;
    }

    this.logger.log(
      `Found ${workspaceYearlyChargesMapList.length} workspaces with yearly charges to emmit`,
    );

    for (const workspaceChargeMap of workspaceYearlyChargesMapList) {
      const [workspaceId, workspaceCharges] = workspaceChargeMap;

      await Promise.all(
        workspaceCharges.map((chargeId) =>
          this.messageQueueService.add<ChargeEmmitBillJob>(
            ChageEmmitBillJob.name,
            {
              chargeId,
              workspaceId,
            },
          ),
        ),
      );
    }
  }
}
