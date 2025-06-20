// packages/twenty-server/src/engine/core-modules/billing/crons/jobs/check-inter-payment-expiration.job.ts
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  ChageEmmitBillJob,
  ChargeEmmitBillJob,
} from 'src/modules/charges/jobs/charge-emmit-bill.job';

// '0 0 1 * *'
export const CHARGE_EMMIT_MONTHLY_BILL_CRON_PATTERN = '*/1 * * * *'; // Run every month on day 1

const MOCK_MONTHLY_CHARGE_IDS = [
  'charge-monthly-1',
  'charge-monthly-2',
  'charge-monthly-3',
];

@Processor(MessageQueue.cronQueue)
export class ChargeEmmitMonthlyBillCronJob {
  private readonly logger = new Logger(ChargeEmmitMonthlyBillCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.chargeQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(ChargeEmmitMonthlyBillCronJob.name)
  @SentryCronMonitor(
    ChargeEmmitMonthlyBillCronJob.name,
    CHARGE_EMMIT_MONTHLY_BILL_CRON_PATTERN,
  )
  async handle() {
    this.logger.warn(`Checking monthly charges to emmit`);

    await Promise.all(
      MOCK_MONTHLY_CHARGE_IDS.map((chargeId) =>
        this.messageQueueService.add<ChargeEmmitBillJob>(
          ChageEmmitBillJob.name,
          {
            chargeId,
            workspaceId: 'mock-workspace-id',
          },
        ),
      ),
    );
  }
}
