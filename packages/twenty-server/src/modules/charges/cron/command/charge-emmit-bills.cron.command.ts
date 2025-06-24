// packages/twenty-server/src/engine/core-modules/billing/crons/commands/check-inter-payment-expiration.command.ts
import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CHARGE_EMMIT_MONTHLY_BILL_CRON_PATTERN,
  ChargeEmmitMonthlyBillCronJob,
} from 'src/modules/charges/cron/jobs/charge-emmit-monthly-bill.cron.job';
import {
  CHARGE_EMMIT_YEARLY_BILL_CRON_PATTERN,
  ChargeEmmitYearlyBillCronJob,
} from 'src/modules/charges/cron/jobs/charge-emmit-yearly-bill.cron.job';

@Command({
  name: 'cron:charge-emmit-recurrent-bills',
  description: 'Starts a cron job to check for expired Inter payments',
})
export class ChargeEmmitRecurrentBillsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ChargeEmmitMonthlyBillCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: CHARGE_EMMIT_MONTHLY_BILL_CRON_PATTERN },
      },
    });

    await this.messageQueueService.addCron<undefined>({
      jobName: ChargeEmmitYearlyBillCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: CHARGE_EMMIT_YEARLY_BILL_CRON_PATTERN,
        },
      },
    });
  }
}
