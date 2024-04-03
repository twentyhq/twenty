import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Repository } from 'typeorm';
import { calendar_v3 } from 'googleapis';

import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/services/providers/google-calendar/google-calendar.provider';
import { googleCalendarSearchFilterExcludeEmails } from 'src/modules/calendar/utils/google-calendar-search-filter.util';
import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association.repository';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { CalendarEventRepository } from 'src/modules/calendar/repositories/calendar-event.repository';
import { formatGoogleCalendarEvent } from 'src/modules/calendar/utils/format-google-calendar-event.util';
import { CalendarEventAttendeeRepository } from 'src/modules/calendar/repositories/calendar-event-attendee.repository';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarEventAttendeeObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-attendee.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { CalendarEventAttendeeService } from 'src/modules/calendar/services/calendar-event-attendee/calendar-event-attendee.service';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarEventAttendee } from 'src/modules/calendar/types/calendar-event';

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
    @Inject(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(CalendarEventObjectMetadata)
    private readonly calendarEventRepository: CalendarEventRepository,
    @InjectObjectMetadataRepository(CalendarChannelObjectMetadata)
    private readonly calendarChannelRepository: CalendarChannelRepository,
    @InjectObjectMetadataRepository(
      CalendarChannelEventAssociationObjectMetadata,
    )
    private readonly calendarChannelEventAssociationRepository: CalendarChannelEventAssociationRepository,
    @InjectObjectMetadataRepository(CalendarEventAttendeeObjectMetadata)
    private readonly calendarEventAttendeesRepository: CalendarEventAttendeeRepository,
    @InjectObjectMetadataRepository(BlocklistObjectMetadata)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly eventEmitter: EventEmitter2,
    private readonly calendarEventAttendeesService: CalendarEventAttendeeService,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  public async startGoogleCalendarSync(
    workspaceId: string,
    connectedAccountId: string,
    pageToken?: string,
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
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
      );
    }

    const calendarChannel =
      await this.calendarChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    const syncToken = calendarChannel?.syncCursor || undefined;

    if (!calendarChannel) {
      return;
    }

    const calendarChannelId = calendarChannel.id;

    const googleCalendarClient =
      await this.googleCalendarClientProvider.getGoogleCalendarClient(
        refreshToken,
      );

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

    const blocklistedEmails = blocklist.map((blocklist) => blocklist.handle);

    let startTime = Date.now();

    let nextSyncToken: string | null | undefined;
    let nextPageToken: string | null | undefined = pageToken;
    const events: calendar_v3.Schema$Event[] = [];

    while (true) {
      const googleCalendarEvents = await googleCalendarClient.events.list({
        calendarId: 'primary',
        maxResults: 500,
        syncToken,
        pageToken,
        q: googleCalendarSearchFilterExcludeEmails(blocklistedEmails),
      });

      nextSyncToken = googleCalendarEvents.data.nextSyncToken;
      nextPageToken = googleCalendarEvents.data.nextPageToken;

      const { items } = googleCalendarEvents.data;

      if (!items || items.length === 0) {
        break;
      }

      events.push(...items);

      if (!nextPageToken) {
        break;
      }
    }

    let endTime = Date.now();

    this.logger.log(
      `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId} getting events list in ${
        endTime - startTime
      }ms.`,
    );

    if (!events || events?.length === 0) {
      this.logger.log(
        `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    const eventExternalIds = events.map((event) => event.id as string);

    startTime = Date.now();

    const existingCalendarChannelEventAssociations =
      await this.calendarChannelEventAssociationRepository.getByEventExternalIdsAndCalendarChannelId(
        eventExternalIds,
        calendarChannelId,
        workspaceId,
      );

    endTime = Date.now();

    this.logger.log(
      `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: getting existing calendar channel event associations in ${
        endTime - startTime
      }ms.`,
    );

    const formattedEvents = events
      .filter((event) => event.status !== 'cancelled')
      .map((event) => formatGoogleCalendarEvent(event));

    // TODO: When we will be able to add unicity contraint on iCalUID, we will do a INSERT ON CONFLICT DO UPDATE

    const existingEventExternalIds =
      existingCalendarChannelEventAssociations.map(
        (association) => association.eventExternalId,
      );

    const eventsToSave = formattedEvents.filter(
      (event) => !existingEventExternalIds.includes(event.externalId),
    );

    const eventsToUpdate = formattedEvents.filter((event) =>
      existingEventExternalIds.includes(event.externalId),
    );

    const eventsToDelete = existingCalendarChannelEventAssociations.filter(
      (association) => !eventExternalIds.includes(association.eventExternalId),
    );

    const eventExternalIdsToDelete = eventsToDelete.map(
      (association) => association.eventExternalId,
    );

    const calendarChannelEventAssociationsToSave = eventsToSave.map(
      (event) => ({
        calendarEventId: event.id,
        eventExternalId: event.externalId,
        calendarChannelId,
      }),
    );

    const attendeesToSave = eventsToSave.flatMap((event) => event.attendees);

    const attendeesToUpdate = eventsToUpdate.flatMap(
      (event) => event.attendees,
    );

    const iCalUIDCalendarEventIdMap =
      await this.calendarEventRepository.getICalUIDCalendarEventIdMap(
        eventsToUpdate.map((event) => event.iCalUID),
        workspaceId,
      );

    let newCalendarEventAttendees: CalendarEventAttendee[] = [];

    if (events.length > 0) {
      const dataSourceMetadata =
        await this.workspaceDataSourceService.connectToWorkspaceDataSource(
          workspaceId,
        );

      try {
        dataSourceMetadata?.transaction(async (transactionManager) => {
          startTime = Date.now();

          await this.calendarEventRepository.saveCalendarEvents(
            eventsToSave,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: saving events in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarEventRepository.updateCalendarEvents(
            eventsToUpdate,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: updating events in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarChannelEventAssociationRepository.saveCalendarChannelEventAssociations(
            calendarChannelEventAssociationsToSave,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: saving calendar channel event associations in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarEventAttendeesService.saveCalendarEventAttendees(
            attendeesToSave,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: saving attendees in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          newCalendarEventAttendees =
            await this.calendarEventAttendeesRepository.updateCalendarEventAttendeesAndReturnNewOnes(
              attendeesToUpdate,
              iCalUIDCalendarEventIdMap,
              workspaceId,
              transactionManager,
            );

          endTime = Date.now();

          this.logger.log(
            `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: updating attendees in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarChannelEventAssociationRepository.deleteByEventExternalIdsAndCalendarChannelId(
            eventExternalIdsToDelete,
            calendarChannelId,
            workspaceId,
            transactionManager,
          );

          await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
            workspaceId,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: deleting calendar channel event associations in ${
              endTime - startTime
            }ms.`,
          );
        });

        if (calendarChannel.isContactAutoCreationEnabled) {
          const contactsToCreate = attendeesToSave.concat(
            newCalendarEventAttendees,
          );

          this.eventEmitter.emit(`createContacts`, {
            workspaceId,
            connectedAccountHandle: connectedAccount.handle,
            contactsToCreate,
          });
        }
      } catch (error) {
        this.logger.error(
          `Error during google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: ${error.message}`,
        );
      }
    } else {
      this.logger.log(
        `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );
    }

    if (!nextSyncToken) {
      throw new Error(
        `No next sync token found for connected account ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
      );
    }

    startTime = Date.now();

    await this.calendarChannelRepository.updateSyncCursor(
      nextSyncToken,
      calendarChannel.id,
      workspaceId,
    );

    endTime = Date.now();

    this.logger.log(
      `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId}: updating sync cursor in ${
        endTime - startTime
      }ms.`,
    );

    this.logger.log(
      `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId} ${
        nextPageToken ? `and ${nextPageToken} pageToken` : ''
      } done.`,
    );
  }
}
