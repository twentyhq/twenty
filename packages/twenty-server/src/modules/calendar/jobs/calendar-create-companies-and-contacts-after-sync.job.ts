import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { CalendarEventParticipantRepository } from 'src/modules/calendar/repositories/calendar-event-participant.repository';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';

export type CalendarCreateCompaniesAndContactsAfterSyncJobData = {
  workspaceId: string;
  calendarChannelId: string;
};

@Injectable()
export class CalendarCreateCompaniesAndContactsAfterSyncJob
  implements
    MessageQueueJob<CalendarCreateCompaniesAndContactsAfterSyncJobData>
{
  private readonly logger = new Logger(
    CalendarCreateCompaniesAndContactsAfterSyncJob.name,
  );
  constructor(
    private readonly createCompaniesAndContactsService: CreateCompanyAndContactService,
    @InjectObjectMetadataRepository(CalendarChannelObjectMetadata)
    private readonly calendarChannelService: CalendarChannelRepository,
    @InjectObjectMetadataRepository(CalendarEventParticipantObjectMetadata)
    private readonly calendarEventParticipantRepository: CalendarEventParticipantRepository,
  ) {}

  async handle(
    data: CalendarCreateCompaniesAndContactsAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and calendarChannel ${data.calendarChannelId}`,
    );
    const { workspaceId, calendarChannelId } = data;

    const calendarChannel = await this.calendarChannelService.getByIds(
      [calendarChannelId],
      workspaceId,
    );

    const { handle, isContactAutoCreationEnabled } = calendarChannel[0];

    if (!isContactAutoCreationEnabled) {
      return;
    }

    const calendarEventParticipantsWithoutPersonIdAndWorkspaceMemberId =
      await this.calendarEventParticipantRepository.getByCalendarChannelIdWithoutPersonIdAndWorkspaceMemberId(
        calendarChannelId,
        workspaceId,
      );

    await this.createCompaniesAndContactsService.createCompaniesAndContactsAndUpdateParticipantsAfterSync(
      handle,
      calendarEventParticipantsWithoutPersonIdAndWorkspaceMemberId,
      workspaceId,
    );

    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and calendarChannel ${data.calendarChannelId} done`,
    );
  }
}
