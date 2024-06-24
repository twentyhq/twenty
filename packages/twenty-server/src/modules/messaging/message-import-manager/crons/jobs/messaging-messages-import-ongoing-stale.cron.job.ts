import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import {
  MessagingMessagesImportOngoingStaleJob,
  MessagingMessagesImportOngoingStaleJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import-ongoing-stale.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';

@Processor(MessageQueue.cronQueue)
export class MessagingMessagesImportOngoingStaleCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    private readonly environmentService: EnvironmentService,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(MessagingMessagesImportOngoingStaleCronJob.name)
  async handle(): Promise<void> {
    const workspaceIds = (
      await this.workspaceRepository.find({
        where: this.environmentService.get('IS_BILLING_ENABLED')
          ? {
              subscriptionStatus: In(['active', 'trialing', 'past_due']),
            }
          : {},
        select: ['id'],
      })
    ).map((workspace) => workspace.id);

    const dataSources = await this.dataSourceRepository.find({
      where: {
        workspaceId: In(workspaceIds),
      },
    });

    const workspaceIdsWithDataSources = new Set(
      dataSources.map((dataSource) => dataSource.workspaceId),
    );

    for (const workspaceId of workspaceIdsWithDataSources) {
      await this.messageQueueService.add<MessagingMessagesImportOngoingStaleJobData>(
        MessagingMessagesImportOngoingStaleJob.name,
        {
          workspaceId,
        },
      );
    }
  }
}
