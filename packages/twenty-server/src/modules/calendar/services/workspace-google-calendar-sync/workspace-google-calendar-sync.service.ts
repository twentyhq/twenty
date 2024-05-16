import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import {
  GoogleCalendarSyncJobData,
  GoogleCalendarSyncJob,
} from 'src/modules/calendar/jobs/google-calendar-sync.job';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';

@Injectable()
export class WorkspaceGoogleCalendarSyncService {
  constructor(
    @InjectObjectMetadataRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: CalendarChannelRepository,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  public async startWorkspaceGoogleCalendarSync(
    workspaceId: string,
  ): Promise<void> {
    const calendarChannels =
      await this.calendarChannelRepository.getAll(workspaceId);

    for (const calendarChannel of calendarChannels) {
      if (!calendarChannel?.isSyncEnabled) {
        continue;
      }

      await this.messageQueueService.add<GoogleCalendarSyncJobData>(
        GoogleCalendarSyncJob.name,
        {
          workspaceId,
          connectedAccountId: calendarChannel.connectedAccountId,
        },
        {
          retryLimit: 2,
        },
      );
    }
  }
}
