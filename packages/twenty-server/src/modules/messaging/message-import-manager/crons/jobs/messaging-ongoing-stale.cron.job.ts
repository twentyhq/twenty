import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  MessagingOngoingStaleJobData,
  MessagingOngoingStaleJob,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';
import { BillingService } from 'src/engine/core-modules/billing/billing.service';

@Processor(MessageQueue.cronQueue)
export class MessagingOngoingStaleCronJob {
  constructor(
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly billingService: BillingService,
  ) {}

  @Process(MessagingOngoingStaleCronJob.name)
  async handle(): Promise<void> {
    const workspaceIds =
      await this.billingService.getActiveSubscriptionWorkspaceIds();

    const dataSources = await this.dataSourceRepository.find({
      where: {
        workspaceId: In(workspaceIds),
      },
    });

    const workspaceIdsWithDataSources = new Set(
      dataSources.map((dataSource) => dataSource.workspaceId),
    );

    for (const workspaceId of workspaceIdsWithDataSources) {
      await this.messageQueueService.add<MessagingOngoingStaleJobData>(
        MessagingOngoingStaleJob.name,
        {
          workspaceId,
        },
      );
    }
  }
}
