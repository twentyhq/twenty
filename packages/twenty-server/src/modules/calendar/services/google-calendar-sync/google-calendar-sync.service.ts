import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { calendar_v3 as calendarV3 } from 'googleapis';
import { GaxiosError } from 'gaxios';

import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/services/providers/google-calendar/google-calendar.provider';
import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association.repository';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { CalendarEventRepository } from 'src/modules/calendar/repositories/calendar-event.repository';
import { formatGoogleCalendarEvent } from 'src/modules/calendar/utils/format-google-calendar-event.util';
import { CalendarEventParticipantRepository } from 'src/modules/calendar/repositories/calendar-event-participant.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { CalendarEventWithParticipants } from 'src/modules/calendar/types/calendar-event';
import { filterOutBlocklistedEvents } from 'src/modules/calendar/utils/filter-out-blocklisted-events.util';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CreateCompanyAndContactJobData,
  CreateCompanyAndContactJob,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(CalendarEventWorkspaceEntity)
    private readonly calendarEventRepository: CalendarEventRepository,
    @InjectObjectMetadataRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: CalendarChannelRepository,
    @InjectObjectMetadataRepository(
      CalendarChannelEventAssociationWorkspaceEntity,
    )
    private readonly calendarChannelEventAssociationRepository: CalendarChannelEventAssociationRepository,
    @InjectObjectMetadataRepository(CalendarEventParticipantWorkspaceEntity)
    private readonly calendarEventParticipantsRepository: CalendarEventParticipantRepository,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
    private readonly calendarEventParticipantsService: CalendarEventParticipantService,
    @InjectMessageQueue(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
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

    const blocklist = await this.getBlocklist(workspaceMemberId, workspaceId);

    let filteredEvents = filterOutBlocklistedEvents(events, blocklist).filter(
      (event) => event.status !== 'cancelled',
    );

    if (emailOrDomainToReimport) {
      // We still need to filter the events to only keep the ones that have the email or domain we want to reimport
      // because the q parameter in the list method also filters the events that have the email or domain in their summary, description ...
      // The q parameter allows us to narrow down the events
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

    const iCalUIDCalendarEventIdMap =
      await this.calendarEventRepository.getICalUIDCalendarEventIdMap(
        filteredEvents.map((calendarEvent) => calendarEvent.iCalUID as string),
        workspaceId,
      );

    const formattedEvents = filteredEvents.map((event) =>
      formatGoogleCalendarEvent(event, iCalUIDCalendarEventIdMap),
    );

    // TODO: When we will be able to add unicity contraint on iCalUID, we will do a INSERT ON CONFLICT DO UPDATE

    let startTime = Date.now();

    const existingEvents = await this.calendarEventRepository.getByICalUIDs(
      formattedEvents.map((event) => event.iCalUID),
      workspaceId,
    );

    const existingEventsICalUIDs = existingEvents.map((event) => event.iCalUID);

    let endTime = Date.now();

    const eventsToSave = formattedEvents.filter(
      (event) => !existingEventsICalUIDs.includes(event.iCalUID),
    );

    const eventsToUpdate = formattedEvents.filter((event) =>
      existingEventsICalUIDs.includes(event.iCalUID),
    );

    startTime = Date.now();

    const existingCalendarChannelEventAssociations =
      await this.calendarChannelEventAssociationRepository.getByEventExternalIdsAndCalendarChannelId(
        formattedEvents.map((event) => event.externalId),
        calendarChannelId,
        workspaceId,
      );

    endTime = Date.now();

    this.logger.log(
      `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: getting existing calendar channel event associations in ${
        endTime - startTime
      }ms.`,
    );

    const calendarChannelEventAssociationsToSave = formattedEvents
      .filter(
        (event) =>
          !existingCalendarChannelEventAssociations.some(
            (association) => association.eventExternalId === event.id,
          ),
      )
      .map((event) => ({
        calendarEventId: event.id,
        eventExternalId: event.externalId,
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

      await this.calendarChannelEventAssociationRepository.deleteByEventExternalIdsAndCalendarChannelId(
        cancelledEventExternalIds,
        calendarChannelId,
        workspaceId,
      );

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

    await this.calendarChannelRepository.updateSyncCursor(
      nextSyncToken,
      calendarChannel.id,
      workspaceId,
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
        .catch((error: GaxiosError) => {
          if (error.response?.status !== 410) {
            throw error;
          }

          return;
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
    connectedAccount: ConnectedAccountWorkspaceEntity,
    calendarChannel: CalendarChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const dataSourceMetadata =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const participantsToSave = eventsToSave.flatMap(
      (event) => event.participants,
    );

    const participantsToUpdate = eventsToUpdate.flatMap(
      (event) => event.participants,
    );

    let startTime: number;
    let endTime: number;

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
          `google calendar sync for workspace ${workspaceId} and account ${
            connectedAccount.id
          }: saving ${eventsToSave.length} events in ${endTime - startTime}ms.`,
        );

        startTime = Date.now();

        await this.calendarEventRepository.updateCalendarEvents(
          eventsToUpdate,
          workspaceId,
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

        await this.calendarChannelEventAssociationRepository.saveCalendarChannelEventAssociations(
          calendarChannelEventAssociationsToSave,
          workspaceId,
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

        const newCalendarEventParticipants =
          await this.calendarEventParticipantsRepository.updateCalendarEventParticipantsAndReturnNewOnes(
            participantsToUpdate,
            workspaceId,
            transactionManager,
          );

        endTime = Date.now();

        participantsToSave.push(...newCalendarEventParticipants);

        this.logger.log(
          `google calendar sync for workspace ${workspaceId} and account ${
            connectedAccount.id
          }: updating participants in ${endTime - startTime}ms.`,
        );

        startTime = Date.now();

        await this.calendarEventParticipantsService.saveCalendarEventParticipants(
          participantsToSave,
          workspaceId,
          transactionManager,
        );

        endTime = Date.now();

        this.logger.log(
          `google calendar sync for workspace ${workspaceId} and account ${
            connectedAccount.id
          }: saving participants in ${endTime - startTime}ms.`,
        );
      });

      if (calendarChannel.isContactAutoCreationEnabled) {
        await this.messageQueueService.add<CreateCompanyAndContactJobData>(
          CreateCompanyAndContactJob.name,
          {
            workspaceId,
            connectedAccountHandle: connectedAccount.handle,
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
