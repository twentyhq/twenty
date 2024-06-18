import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  GoogleCalendarSyncJobData,
  GoogleCalendarSyncJob,
} from 'src/modules/calendar/jobs/google-calendar-sync.job';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';

@Injectable()
export class WorkspaceGoogleCalendarSyncService {
  constructor(
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  public async startWorkspaceGoogleCalendarSync(
    workspaceId: string,
  ): Promise<void> {
    const calendarChannels = await this.calendarChannelRepository.find({});

    for (const calendarChannel of calendarChannels) {
      if (!calendarChannel?.isSyncEnabled) {
        continue;
      }

      await this.messageQueueService.add<GoogleCalendarSyncJobData>(
        GoogleCalendarSyncJob.name,
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
