import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { injectIdsInCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/inject-ids-in-calendar-events.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
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
    const calendarEventRepository =
      await this.twentyORMManager.getRepository<CalendarEventWorkspaceEntity>(
        'calendarEvent',
      );

    const existingCalendarEvents = await calendarEventRepository.find({
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

    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      );

    const existingCalendarChannelEventAssociations =
      await calendarChannelEventAssociationRepository.find({
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

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    await workspaceDataSource?.transaction(async (transactionManager) => {
      await calendarEventRepository.save(eventsToSave, {}, transactionManager);

      await calendarEventRepository.save(
        eventsToUpdate,
        {},
        transactionManager,
      );

      await calendarChannelEventAssociationRepository.save(
        calendarChannelEventAssociationsToSave,
        {},
        transactionManager,
      );

      await this.calendarEventParticipantService.upsertAndDeleteCalendarEventParticipants(
        participantsToSave,
        participantsToUpdate,
        transactionManager,
      );
    });

    this.eventEmitter.emit(`calendarEventParticipant.matched`, {
      workspaceId,
      name: 'calendarEventParticipant.matched',
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
          source: FieldActorSource.CALENDAR,
        },
      );
    }
  }
}
