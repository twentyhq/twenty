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

// '0 0 1 * *'
export const CHARGE_EMMIT_MONTHLY_BILL_CRON_PATTERN = '*/1 * * * *'; // Run every month on day 1

@Processor(MessageQueue.cronQueue)
export class ChargeEmmitMonthlyBillCronJob {
  private readonly logger = new Logger(ChargeEmmitMonthlyBillCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.chargeQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly chargeService: ChargeService,
  ) {}

  @Process(ChargeEmmitMonthlyBillCronJob.name)
  @SentryCronMonitor(
    ChargeEmmitMonthlyBillCronJob.name,
    CHARGE_EMMIT_MONTHLY_BILL_CRON_PATTERN,
  )
  async handle() {
    this.logger.warn(`Checking monthly charges to emmit`);

    const workspaceMonthlyChargesMap =
      await this.chargeService.getWorkspaceChargesMapByRecurrence(
        ChargeRecurrence.MONTHLY,
      );

    const workspaceMonthlyChargesMapList = Object.entries(
      workspaceMonthlyChargesMap,
    );

    if (workspaceMonthlyChargesMapList.length === 0) {
      this.logger.warn(`No monthly charges found to emmit`);

      return;
    }

    this.logger.log(
      `Found ${workspaceMonthlyChargesMapList.length} workspaces with monthly charges to emmit`,
    );

    for (const workspaceChargeMap of workspaceMonthlyChargesMapList) {
      const [workspaceId, workspaceCharges] = workspaceChargeMap;

      this.logger.log(
        `Found ${workspaceCharges.length} charges to emmit for workspace ${workspaceId}`,
      );

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
