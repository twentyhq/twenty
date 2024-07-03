import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { BillingService } from 'src/engine/core-modules/billing/billing.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  CalendarEventsImportJobData,
  CalendarEventsImportJob,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-events-import.job';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@Processor({
  queueName: MessageQueue.cronQueue,
})
export class CalendarEventsImportCronJob {
  constructor(
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly billingService: BillingService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @Process(CalendarEventsImportCronJob.name)
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
      const calendarChannelRepository =
        await this.twentyORMManager.getRepositoryForWorkspace(
          workspaceId,
          CalendarChannelWorkspaceEntity,
        );

      const calendarChannels = await calendarChannelRepository.find({});

      for (const calendarChannel of calendarChannels) {
        if (!calendarChannel?.isSyncEnabled) {
          continue;
        }

        await this.messageQueueService.add<CalendarEventsImportJobData>(
          CalendarEventsImportJob.name,
          {
            workspaceId,
            connectedAccountId: calendarChannel.connectedAccountId,
          },
        );
      }
    }
  }
}
