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

// '0 0 1 1 *'
export const CHARGE_EMMIT_YEARLY_BILL_CRON_PATTERN = '*/5 * * * *'; // Run every year on day 1 ad midnight

const MOCK_YEARLY_CHARGE_IDS = [
  'charge-yearly-1',
  'charge-yearly-2',
  'charge-yearly-3',
];

@Processor(MessageQueue.cronQueue)
export class ChargeEmmitYearlyBillCronJob {
  private readonly logger = new Logger(ChargeEmmitYearlyBillCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.chargeQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(ChargeEmmitYearlyBillCronJob.name)
  @SentryCronMonitor(
    ChargeEmmitYearlyBillCronJob.name,
    CHARGE_EMMIT_YEARLY_BILL_CRON_PATTERN,
  )
  async handle() {
    this.logger.warn(`Checking yearly charges to emmit`);

    await Promise.all(
      MOCK_YEARLY_CHARGE_IDS.map((chargeId) =>
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
