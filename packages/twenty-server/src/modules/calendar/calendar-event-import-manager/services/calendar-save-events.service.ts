import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { existingCalendarEventsMapper } from 'src/modules/calendar/calendar-event-import-manager/utils/calendar-event-mapper.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
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

    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      );

    const existingCalendarEvents = await calendarEventRepository.find({
      where: {
        iCalUID: Any(filteredEvents.map((event) => event.iCalUID as string)),
      },
    });

    const existingCalendarEventsMap = existingCalendarEventsMapper(
      existingCalendarEvents,
    );

    const filteredEventsWithAction = filteredEvents.map((event) => {
      const existingEventWithSameiCalUID = existingCalendarEventsMap.get(
        event.iCalUID,
      );

      if (existingEventWithSameiCalUID) {
        return { ...event, toBeSaved: false };
      }

      return { ...event, toBeSaved: true };
    });

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    await workspaceDataSource?.transaction(
      async (transactionManager: WorkspaceEntityManager) => {
        const savedCalendarEvents = await calendarEventRepository.save(
          filteredEventsWithAction
            .filter((event) => event.toBeSaved)
            .map(
              (calendarEvent) =>
                ({
                  iCalUID: calendarEvent.iCalUID,
                  title: calendarEvent.title,
                  description: calendarEvent.description,
                  startsAt: calendarEvent.startsAt,
                  endsAt: calendarEvent.endsAt,
                  location: calendarEvent.location,
                  isFullDay: calendarEvent.isFullDay,
                  isCanceled: calendarEvent.isCanceled,
                  conferenceSolution: calendarEvent.conferenceSolution,
                  conferenceLink: {
                    primaryLinkLabel: calendarEvent.conferenceLinkLabel,
                    primaryLinkUrl: calendarEvent.conferenceLinkUrl,
                  },
                  externalCreatedAt: calendarEvent.externalCreatedAt,
                  externalUpdatedAt: calendarEvent.externalUpdatedAt,
                }) satisfies DeepPartial<CalendarEventWorkspaceEntity>,
            ),
          {},
          transactionManager,
        );

        await calendarEventRepository.save(
          filteredEventsWithAction
            .filter((event) => !event.toBeSaved)
            .map(
              (calendarEvent) =>
                ({
                  id: existingCalendarEventsMap.get(calendarEvent.iCalUID),
                  iCalUID: calendarEvent.iCalUID,
                  title: calendarEvent.title,
                  description: calendarEvent.description,
                  startsAt: calendarEvent.startsAt,
                  endsAt: calendarEvent.endsAt,
                  location: calendarEvent.location,
                  isFullDay: calendarEvent.isFullDay,
                  isCanceled: calendarEvent.isCanceled,
                  conferenceSolution: calendarEvent.conferenceSolution,
                  conferenceLink: {
                    primaryLinkLabel: calendarEvent.conferenceLinkLabel,
                    primaryLinkUrl: calendarEvent.conferenceLinkUrl,
                  },
                  externalCreatedAt: calendarEvent.externalCreatedAt,
                  externalUpdatedAt: calendarEvent.externalUpdatedAt,
                }) satisfies DeepPartial<CalendarEventWorkspaceEntity>,
            ),
          {},
          transactionManager,
        );

        const filteredEventsWithActionAndIds = filteredEventsWithAction.map(
          (event) => {
            if (event.toBeSaved) {
              const savedCalendarEventId = savedCalendarEvents.find(
                (savedEvent) => savedEvent.iCalUID === event.iCalUID,
              )?.id;

              if (!savedCalendarEventId) {
                throw new Error(
                  `Saved event with iCalUID ${event.iCalUID} not found - should never happen`,
                );
              }

              return {
                ...event,
                id: savedCalendarEventId,
              };
            } else {
              const id = existingCalendarEventsMap.get(event.iCalUID);

              if (!id) {
                throw new Error(
                  `Updated event with iCalUID ${event.iCalUID} not found - should never happen`,
                );
              }

              return {
                ...event,
                id,
              };
            }
          },
        );

        const calendarChannelEventAssociationsToSave =
          filteredEventsWithActionAndIds.map((calendarEvent) => ({
            calendarEventId: calendarEvent.id,
            eventExternalId: calendarEvent.externalId,
            calendarChannelId: calendarChannel.id,
            recurringEventExternalId: calendarEvent.recurringEventExternalId,
          }));

        await calendarChannelEventAssociationRepository.save(
          calendarChannelEventAssociationsToSave,
          {},
          transactionManager,
        );

        const participantsWithCalendarEventId =
          filteredEventsWithActionAndIds.map((event) => {
            const participantsWithCalendarEventId = event.participants.map(
              (participant) => ({
                ...participant,
                calendarEventId: event.id,
              }),
            );

            return {
              ...event,
              participants: participantsWithCalendarEventId,
            };
          });

        const participantsToSave = participantsWithCalendarEventId
          .filter((event) => event.toBeSaved)
          .flatMap((event) => event.participants);

        const participantsToUpdate = participantsWithCalendarEventId
          .filter((event) => !event.toBeSaved)
          .flatMap((event) => event.participants);

        await this.calendarEventParticipantService.upsertAndDeleteCalendarEventParticipants(
          participantsToSave,
          participantsToUpdate,
          transactionManager,
        );
      },
    );

    const participantsToSave = filteredEventsWithAction
      .filter((event) => event.toBeSaved)
      .flatMap((event) => event.participants);

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
