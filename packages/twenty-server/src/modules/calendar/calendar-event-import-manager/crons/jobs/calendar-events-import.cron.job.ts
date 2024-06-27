import { InjectRepository } from '@nestjs/typeorm';
import { Scope } from '@nestjs/common';

import { Repository, In } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import {
  CalendarEventsImportJobData,
  CalendarEventsImportJob,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-events-import.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventsImportCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    private readonly environmentService: EnvironmentService,
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(CalendarEventsImportCronJob.name)
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
      const calendarChannels = await this.calendarChannelRepository.find({});

      for (const calendarChannel of calendarChannels) {
        if (!calendarChannel?.isSyncEnabled) {
          continue;
        }

        await this.messageQueueService.add<CalendarEventsImportJobData>(
          CalendarEventsImportJob.name,
          {
            workspaceId,
            connectedAccountId: calendarChannel.connectedAccount.id,
          },
          {
            retryLimit: 2,
          },
        );
      }
    }
  }
}
