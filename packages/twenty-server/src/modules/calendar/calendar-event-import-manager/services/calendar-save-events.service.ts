import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any } from 'typeorm';

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
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { injectIdsInCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/inject-ids-in-calendar-events.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    @InjectWorkspaceRepository(CalendarEventWorkspaceEntity)
    private readonly calendarEventRepository: WorkspaceRepository<CalendarEventWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelEventAssociationWorkspaceEntity)
    private readonly calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>,
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async saveCalendarEventsAndEnqueueContactCreationJob(
    filteredEvents: CalendarEventWithParticipants[],
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const existingCalendarEvents = await this.calendarEventRepository.find({
      where: {
        iCalUID: Any(filteredEvents.map((event) => event.iCalUID as string)),
      },
    });

    const iCalUIDCalendarEventIdMap = new Map(
      existingCalendarEvents.map((calendarEvent) => [
        calendarEvent.iCalUID,
        calendarEvent.id,
      ]),
    );

    const calendarEventsWithIds = injectIdsInCalendarEvents(
      filteredEvents,
      iCalUIDCalendarEventIdMap,
    );

    // TODO: When we will be able to add unicity contraint on iCalUID, we will do a INSERT ON CONFLICT DO UPDATE

    const existingEventsICalUIDs = existingCalendarEvents.map(
      (calendarEvent) => calendarEvent.iCalUID,
    );

    const eventsToSave = calendarEventsWithIds.filter(
      (calendarEvent) =>
        !existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    const eventsToUpdate = calendarEventsWithIds.filter((calendarEvent) =>
      existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    const existingCalendarChannelEventAssociations =
      await this.calendarChannelEventAssociationRepository.find({
        where: {
          eventExternalId: Any(
            calendarEventsWithIds.map((calendarEvent) => calendarEvent.id),
          ),
          calendarChannel: {
            id: calendarChannel.id,
          },
        },
      });

    const calendarChannelEventAssociationsToSave = calendarEventsWithIds
      .filter(
        (calendarEvent) =>
          !existingCalendarChannelEventAssociations.some(
            (association) => association.eventExternalId === calendarEvent.id,
          ),
      )
      .map((calendarEvent) => ({
        calendarEventId: calendarEvent.id,
        eventExternalId: calendarEvent.externalId,
        calendarChannelId: calendarChannel.id,
      }));

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

      await this.calendarEventRepository.save(
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
