import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CalendarEventWithParticipantsAndCalendarEventId } from 'src/modules/calendar/common/types/calendar-event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    @InjectWorkspaceRepository(CalendarEventWorkspaceEntity)
    private readonly calendarEventRepository: WorkspaceRepository<CalendarEventWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelEventAssociationWorkspaceEntity)
    private readonly calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>,
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async saveCalendarEvents(
    eventsToSave: CalendarEventWithParticipantsAndCalendarEventId[],
    eventsToUpdate: CalendarEventWithParticipantsAndCalendarEventId[],
    calendarChannelEventAssociationsToSave: {
      calendarEventId: string;
      eventExternalId: string;
      calendarChannelId: string;
    }[],
    connectedAccount: ConnectedAccountWorkspaceEntity,
    calendarChannel: CalendarChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const participantsToSave = eventsToSave.flatMap(
      (event) => event.participants,
    );

    const participantsToUpdate = eventsToUpdate.flatMap(
      (event) => event.participants,
    );

    const savedCalendarEventParticipantsToEmit: CalendarEventParticipantWorkspaceEntity[] =
      [];

    await this.workspaceDataSource?.transaction(async (transactionManager) => {
      await this.calendarEventRepository.save(
        eventsToSave,
        {},
        transactionManager,
      );

      await this.calendarChannelRepository.save(
        eventsToUpdate,
        {},
        transactionManager,
      );

      await this.calendarChannelEventAssociationRepository.save(
        calendarChannelEventAssociationsToSave,
        {},
        transactionManager,
      );

      await this.calendarEventParticipantService.upsertAndDeleteCalendarEventParticipants(
        participantsToSave,
        participantsToUpdate,
        workspaceId,
        transactionManager,
      );
    });

    this.eventEmitter.emit(`calendarEventParticipant.matched`, {
      workspaceId,
      workspaceMemberId: connectedAccount.accountOwnerId,
      calendarEventParticipants: savedCalendarEventParticipantsToEmit,
    });

    if (calendarChannel.isContactAutoCreationEnabled) {
      await this.messageQueueService.add<CreateCompanyAndContactJobData>(
        CreateCompanyAndContactJob.name,
        {
          workspaceId,
          connectedAccount,
          contactsToCreate: participantsToSave,
        },
      );
    }
  }
}
