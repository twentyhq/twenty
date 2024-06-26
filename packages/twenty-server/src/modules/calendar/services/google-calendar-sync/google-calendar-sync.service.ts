import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any, Repository } from 'typeorm';
import { calendar_v3 as calendarV3 } from 'googleapis';
import { GaxiosError } from 'gaxios';

import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/services/providers/google-calendar/google-calendar.provider';
import { formatGoogleCalendarEvent } from 'src/modules/calendar/utils/format-google-calendar-event.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import {
  CalendarEventParticipant,
  CalendarEventWithParticipants,
} from 'src/modules/calendar/types/calendar-event';
import { filterOutBlocklistedEvents } from 'src/modules/calendar/utils/filter-out-blocklisted-events.util';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { isDefined } from 'src/utils/is-defined';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

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
  ) {}

  public async startGoogleCalendarSync(
    workspaceId: string,
    connectedAccountId: string,
    emailOrDomainToReimport?: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      return;
    }

    const refreshToken = connectedAccount.refreshToken;
    const workspaceMemberId = connectedAccount.accountOwnerId;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId} during sync`,
      );
    }

    const calendarChannel = await this.calendarChannelRepository.findOneBy({
      connectedAccount: {
        id: connectedAccountId,
      },
    });

    const syncToken = calendarChannel?.syncCursor || undefined;

    if (!calendarChannel) {
      return;
    }

    const calendarChannelId = calendarChannel.id;

    const { events, nextSyncToken } = await this.getEventsFromGoogleCalendar(
      refreshToken,
      workspaceId,
      connectedAccountId,
      emailOrDomainToReimport,
      syncToken,
    );

    if (!events || events?.length === 0) {
      this.logger.log(
        `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    if (!workspaceMemberId) {
      throw new Error(
        `Workspace member ID is undefined for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const blocklist = await this.getBlocklist(workspaceMemberId, workspaceId);

    let filteredEvents = filterOutBlocklistedEvents(
      calendarChannel.handle,
      events,
      blocklist,
    ).filter((event) => event.status !== 'cancelled');

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

    let startTime = Date.now();

    const existingEventsICalUIDs = existingCalendarEvents.map(
      (calendarEvent) => calendarEvent.iCalUID,
    );

    let endTime = Date.now();

    const eventsToSave = formattedEvents.filter(
      (calendarEvent) =>
        !existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    const eventsToUpdate = formattedEvents.filter((calendarEvent) =>
      existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    startTime = Date.now();

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

    endTime = Date.now();

    this.logger.log(
      `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: getting existing calendar channel event associations in ${
        endTime - startTime
      }ms.`,
    );

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

    if (events.length > 0) {
      await this.saveGoogleCalendarEvents(
        eventsToSave,
        eventsToUpdate,
        calendarChannelEventAssociationsToSave,
        connectedAccount,
        calendarChannel,
        workspaceId,
      );

      startTime = Date.now();

      await this.calendarChannelEventAssociationRepository.delete({
        eventExternalId: Any(cancelledEventExternalIds),
        calendarChannel: {
          id: calendarChannelId,
        },
      });

      endTime = Date.now();

      this.logger.log(
        `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: deleting calendar channel event associations in ${
          endTime - startTime
        }ms.`,
      );

      startTime = Date.now();

      await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
        workspaceId,
      );

      endTime = Date.now();

      this.logger.log(
        `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: cleaning calendar events in ${
          endTime - startTime
        }ms.`,
      );
    } else {
      this.logger.log(
        `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );
    }

    if (!nextSyncToken) {
      throw new Error(
        `No next sync token found for connected account ${connectedAccountId} in workspace ${workspaceId} during sync`,
      );
    }

    startTime = Date.now();

    await this.calendarChannelRepository.update(
      {
        id: calendarChannel.id,
      },
      {
        syncCursor: nextSyncToken,
      },
    );

    endTime = Date.now();

    this.logger.log(
      `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: updating sync cursor in ${
        endTime - startTime
      }ms.`,
    );

    this.logger.log(
      `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId} ${
        syncToken ? `and ${syncToken} syncToken ` : ''
      }done.`,
    );
  }

  public async getBlocklist(workspaceMemberId: string, workspaceId: string) {
    const isBlocklistEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKeys.IsBlocklistEnabled,
        value: true,
      });

    const isBlocklistEnabled =
      isBlocklistEnabledFeatureFlag && isBlocklistEnabledFeatureFlag.value;

    const blocklist = isBlocklistEnabled
      ? await this.blocklistRepository.getByWorkspaceMemberId(
          workspaceMemberId,
          workspaceId,
        )
      : [];

    return blocklist.map((blocklist) => blocklist.handle);
  }

  public async getEventsFromGoogleCalendar(
    refreshToken: string,
    workspaceId: string,
    connectedAccountId: string,
    emailOrDomainToReimport?: string,
    syncToken?: string,
  ): Promise<{
    events: calendarV3.Schema$Event[];
    nextSyncToken: string | null | undefined;
  }> {
    const googleCalendarClient =
      await this.googleCalendarClientProvider.getGoogleCalendarClient(
        refreshToken,
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
              id: connectedAccountId,
            },
            {
              syncCursor: '',
            },
          );

          this.logger.log(
            `Sync token is no longer valid for connected account ${connectedAccountId} in workspace ${workspaceId}, resetting sync cursor.`,
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
      `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId} getting events list in ${
        endTime - startTime
      }ms.`,
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
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
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

    const savedCalendarEventParticipantsToEmit: ObjectRecord<CalendarEventParticipantWorkspaceEntity>[] =
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
                calendarEvent: {
                  id: Any(
                    participantsToUpdate
                      .map((participant) => participant.calendarEventId)
                      .filter(isDefined),
                  ),
                },
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
