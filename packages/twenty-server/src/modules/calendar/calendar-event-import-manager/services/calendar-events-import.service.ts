import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any, Repository } from 'typeorm';
import { calendar_v3 as calendarV3 } from 'googleapis';
import { GaxiosError } from 'gaxios';

import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { formatGoogleCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/utils/format-google-calendar-event.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import {
  CalendarEventParticipant,
  CalendarEventWithParticipants,
} from 'src/modules/calendar/common/types/calendar-event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { isDefined } from 'src/utils/is-defined';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/providers/google-calendar.provider';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { filterEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events.util';

@Injectable()
export class CalendarEventsImportService {
  private readonly logger = new Logger(CalendarEventsImportService.name);

  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectWorkspaceRepository(CalendarEventWorkspaceEntity)
    private readonly calendarEventRepository: WorkspaceRepository<CalendarEventWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelEventAssociationWorkspaceEntity)
    private readonly calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarEventParticipantWorkspaceEntity)
    private readonly calendarEventParticipantsRepository: WorkspaceRepository<CalendarEventParticipantWorkspaceEntity>,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
    private readonly calendarEventParticipantsService: CalendarEventParticipantService,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
  ) {}

  public async processCalendarEventsImport(
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    emailOrDomainToReimport?: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsCalendarEventsImportOngoing(
      connectedAccount.id,
    );

    const syncToken = calendarChannel?.syncCursor || undefined;

    if (!calendarChannel) {
      return;
    }

    const calendarChannelId = calendarChannel.id;

    const { events, nextSyncToken } = await this.getEventsFromGoogleCalendar(
      connectedAccount,
      workspaceId,
      '',
      syncToken,
    );

    if (!events || events?.length === 0) {
      return;
    }

    const blocklist = await this.blocklistRepository.getByWorkspaceMemberId(
      connectedAccount.accountOwnerId,
      workspaceId,
    );

    let filteredEvents = filterEvents(
      calendarChannel,
      events,
      blocklist.map((e) => e.handle),
    );

    if (emailOrDomainToReimport) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.attendees?.some(
            (attendee) => attendee.email?.endsWith(emailOrDomainToReimport),
          ),
      );
    }

    const cancelledEventExternalIds = filteredEvents
      .filter((event) => event.status === 'cancelled')
      .map((event) => event.id as string);

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

    const formattedEvents = filteredEvents.map((event) =>
      formatGoogleCalendarEvent(event, iCalUIDCalendarEventIdMap),
    );

    // TODO: When we will be able to add unicity contraint on iCalUID, we will do a INSERT ON CONFLICT DO UPDATE

    const existingEventsICalUIDs = existingCalendarEvents.map(
      (calendarEvent) => calendarEvent.iCalUID,
    );

    const eventsToSave = formattedEvents.filter(
      (calendarEvent) =>
        !existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    const eventsToUpdate = formattedEvents.filter((calendarEvent) =>
      existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    const existingCalendarChannelEventAssociations =
      await this.calendarChannelEventAssociationRepository.find({
        where: {
          eventExternalId: Any(
            formattedEvents.map((calendarEvent) => calendarEvent.id),
          ),
          calendarChannel: {
            id: calendarChannelId,
          },
        },
      });

    const calendarChannelEventAssociationsToSave = formattedEvents
      .filter(
        (calendarEvent) =>
          !existingCalendarChannelEventAssociations.some(
            (association) => association.eventExternalId === calendarEvent.id,
          ),
      )
      .map((calendarEvent) => ({
        calendarEventId: calendarEvent.id,
        eventExternalId: calendarEvent.externalId,
        calendarChannelId,
      }));

    await this.saveGoogleCalendarEvents(
      eventsToSave,
      eventsToUpdate,
      calendarChannelEventAssociationsToSave,
      connectedAccount,
      calendarChannel,
      workspaceId,
    );

    await this.calendarChannelEventAssociationRepository.delete({
      eventExternalId: Any(cancelledEventExternalIds),
      calendarChannel: {
        id: calendarChannelId,
      },
    });

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      workspaceId,
    );

    if (!nextSyncToken) {
      throw new Error(
        `No next sync token found for connected account ${connectedAccount.id} in workspace ${workspaceId} during sync`,
      );
    }

    await this.calendarChannelRepository.update(
      {
        id: calendarChannel.id,
      },
      {
        syncCursor: nextSyncToken,
      },
    );

    await this.calendarChannelSyncStatusService.markAsCalendarEventsImportCompleted(
      connectedAccount.id,
    );
  }

  public async getEventsFromGoogleCalendar(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    emailOrDomainToReimport?: string,
    syncToken?: string,
  ): Promise<{
    events: calendarV3.Schema$Event[];
    nextSyncToken: string | null | undefined;
  }> {
    const googleCalendarClient =
      await this.googleCalendarClientProvider.getGoogleCalendarClient(
        connectedAccount,
      );

    const startTime = Date.now();

    let nextSyncToken: string | null | undefined;
    let nextPageToken: string | undefined;
    const events: calendarV3.Schema$Event[] = [];

    let hasMoreEvents = true;

    while (hasMoreEvents) {
      const googleCalendarEvents = await googleCalendarClient.events
        .list({
          calendarId: 'primary',
          maxResults: 500,
          syncToken: emailOrDomainToReimport ? undefined : syncToken,
          pageToken: nextPageToken,
          q: emailOrDomainToReimport,
          showDeleted: true,
        })
        .catch(async (error: GaxiosError) => {
          if (error.response?.status !== 410) {
            throw error;
          }

          await this.calendarChannelRepository.update(
            {
              id: connectedAccount.id,
            },
            {
              syncCursor: '',
            },
          );

          this.logger.log(
            `Sync token is no longer valid for connected account ${connectedAccount.id} in workspace ${workspaceId}, resetting sync cursor.`,
          );

          return {
            data: {
              items: [],
              nextSyncToken: undefined,
              nextPageToken: undefined,
            },
          };
        });

      nextSyncToken = googleCalendarEvents.data.nextSyncToken;
      nextPageToken = googleCalendarEvents.data.nextPageToken || undefined;

      const { items } = googleCalendarEvents.data;

      if (!items || items.length === 0) {
        break;
      }

      events.push(...items);

      if (!nextPageToken) {
        hasMoreEvents = false;
      }
    }

    const endTime = Date.now();

    this.logger.log(
      `google calendar sync for workspace ${workspaceId} and account ${
        connectedAccount.id
      } getting events list in ${endTime - startTime}ms.`,
    );

    return { events, nextSyncToken };
  }

  public async saveGoogleCalendarEvents(
    eventsToSave: CalendarEventWithParticipants[],
    eventsToUpdate: CalendarEventWithParticipants[],
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

    let startTime: number;
    let endTime: number;

    const savedCalendarEventParticipantsToEmit: CalendarEventParticipantWorkspaceEntity[] =
      [];

    try {
      await this.workspaceDataSource?.transaction(
        async (transactionManager) => {
          startTime = Date.now();

          await this.calendarEventRepository.save(
            eventsToSave,
            {},
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${
              connectedAccount.id
            }: saving ${eventsToSave.length} events in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarChannelRepository.save(
            eventsToUpdate,
            {},
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${
              connectedAccount.id
            }: updating ${eventsToUpdate.length} events in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarChannelEventAssociationRepository.save(
            calendarChannelEventAssociationsToSave,
            {},
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${
              connectedAccount.id
            }: saving calendar channel event associations in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          const existingCalendarEventParticipants =
            await this.calendarEventParticipantsRepository.find({
              where: {
                calendarEventId: Any(
                  participantsToUpdate
                    .map((participant) => participant.calendarEventId)
                    .filter(isDefined),
                ),
              },
            });

          const {
            calendarEventParticipantsToDelete,
            newCalendarEventParticipants,
          } = participantsToUpdate.reduce(
            (acc, calendarEventParticipant) => {
              const existingCalendarEventParticipant =
                existingCalendarEventParticipants.find(
                  (existingCalendarEventParticipant) =>
                    existingCalendarEventParticipant.handle ===
                    calendarEventParticipant.handle,
                );

              if (existingCalendarEventParticipant) {
                acc.calendarEventParticipantsToDelete.push(
                  existingCalendarEventParticipant,
                );
              } else {
                acc.newCalendarEventParticipants.push(calendarEventParticipant);
              }

              return acc;
            },
            {
              calendarEventParticipantsToDelete:
                [] as CalendarEventParticipantWorkspaceEntity[],
              newCalendarEventParticipants: [] as CalendarEventParticipant[],
            },
          );

          await this.calendarEventParticipantsRepository.delete({
            id: Any(
              calendarEventParticipantsToDelete.map(
                (calendarEventParticipant) => calendarEventParticipant.id,
              ),
            ),
          });

          await this.calendarEventParticipantsRepository.save(
            participantsToUpdate,
          );

          endTime = Date.now();

          participantsToSave.push(...newCalendarEventParticipants);

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${
              connectedAccount.id
            }: updating participants in ${endTime - startTime}ms.`,
          );

          startTime = Date.now();

          const savedCalendarEventParticipants =
            await this.calendarEventParticipantsService.saveCalendarEventParticipants(
              participantsToSave,
              workspaceId,
              transactionManager,
            );

          savedCalendarEventParticipantsToEmit.push(
            ...savedCalendarEventParticipants,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${
              connectedAccount.id
            }: saving participants in ${endTime - startTime}ms.`,
          );
        },
      );

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
    } catch (error) {
      this.logger.error(
        `Error during google calendar sync for workspace ${workspaceId} and account ${connectedAccount.id}: ${error.message}`,
      );
    }
  }
}
