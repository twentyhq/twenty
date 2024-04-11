import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { CalendarEventParticipantRepository } from 'src/modules/calendar/repositories/calendar-event-participant.repository';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';

export type CalendarCreateCompanyAndContactAfterSyncJobData = {
  workspaceId: string;
  calendarChannelId: string;
};

@Injectable()
export class CalendarCreateCompanyAndContactAfterSyncJob
  implements MessageQueueJob<CalendarCreateCompanyAndContactAfterSyncJobData>
{
  private readonly logger = new Logger(
    CalendarCreateCompanyAndContactAfterSyncJob.name,
  );
  constructor(
    private readonly createCompanyAndContactService: CreateCompanyAndContactService,
    @InjectObjectMetadataRepository(CalendarChannelObjectMetadata)
    private readonly calendarChannelService: CalendarChannelRepository,
    @InjectObjectMetadataRepository(CalendarEventParticipantObjectMetadata)
    private readonly calendarEventParticipantRepository: CalendarEventParticipantRepository,
  ) {}

  async handle(
    data: CalendarCreateCompanyAndContactAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and calendarChannel ${data.calendarChannelId}`,
    );
    const { workspaceId, calendarChannelId } = data;

    const calendarChannels = await this.calendarChannelService.getByIds(
      [calendarChannelId],
      workspaceId,
    );

    if (calendarChannels.length === 0) {
      throw new Error(
        `Calendar channel with id ${calendarChannelId} not found in workspace ${workspaceId}`,
      );
    }

    const { handle, isContactAutoCreationEnabled } = calendarChannels[0];

    if (!isContactAutoCreationEnabled || !handle) {
      return;
    }

    const calendarEventParticipantsWithoutPersonIdAndWorkspaceMemberId =
      await this.calendarEventParticipantRepository.getByCalendarChannelIdWithoutPersonIdAndWorkspaceMemberId(
        calendarChannelId,
        workspaceId,
      );

    await this.createCompanyAndContactService.createCompaniesAndContactsAndUpdateParticipants(
      handle,
      calendarEventParticipantsWithoutPersonIdAndWorkspaceMemberId,
      workspaceId,
    );

    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and calendarChannel ${data.calendarChannelId} done`,
    );
  }
}
