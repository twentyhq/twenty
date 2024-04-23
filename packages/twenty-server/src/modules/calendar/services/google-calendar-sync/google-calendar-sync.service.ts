import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { calendar_v3 as calendarV3 } from 'googleapis';

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
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { CalendarEventParticipant } from 'src/modules/calendar/types/calendar-event';
import { filterOutBlocklistedEvents } from 'src/modules/calendar/utils/filter-out-blocklisted-events.util';
import {
  CreateCompanyAndContactJobData,
  CreateCompanyAndContactJob,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
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
    @InjectObjectMetadataRepository(CalendarEventParticipantObjectMetadata)
    private readonly calendarEventParticipantsRepository: CalendarEventParticipantRepository,
    @InjectObjectMetadataRepository(BlocklistObjectMetadata)
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
    let nextPageToken: string | undefined;
    const events: calendarV3.Schema$Event[] = [];

    let hasMoreEvents = true;

    while (hasMoreEvents) {
      const googleCalendarEvents = await googleCalendarClient.events.list({
        calendarId: 'primary',
        maxResults: 500,
        syncToken,
        pageToken: nextPageToken,
        showDeleted: true,
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

    let endTime = Date.now();

    this.logger.log(
      `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId} getting events list in ${
        endTime - startTime
      }ms.`,
    );

    if (!events || events?.length === 0) {
      this.logger.log(
        `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    const filteredEvents = filterOutBlocklistedEvents(
      events,
      blocklistedEmails,
    );

    const eventExternalIds = filteredEvents.map((event) => event.id as string);

    startTime = Date.now();

    const existingCalendarChannelEventAssociations =
      await this.calendarChannelEventAssociationRepository.getByEventExternalIdsAndCalendarChannelId(
        eventExternalIds,
        calendarChannelId,
        workspaceId,
      );

    endTime = Date.now();

    this.logger.log(
      `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: getting existing calendar channel event associations in ${
        endTime - startTime
      }ms.`,
    );

    // TODO: When we will be able to add unicity contraint on iCalUID, we will do a INSERT ON CONFLICT DO UPDATE

    const existingEventExternalIds =
      existingCalendarChannelEventAssociations.map(
        (association) => association.eventExternalId,
      );

    const existingEventsIds = existingCalendarChannelEventAssociations.map(
      (association) => association.calendarEventId,
    );

    const iCalUIDCalendarEventIdMap =
      await this.calendarEventRepository.getICalUIDCalendarEventIdMap(
        existingEventsIds,
        workspaceId,
      );

    const formattedEvents = filteredEvents
      .filter((event) => event.status !== 'cancelled')
      .map((event) =>
        formatGoogleCalendarEvent(event, iCalUIDCalendarEventIdMap),
      );

    const eventsToSave = formattedEvents.filter(
      (event) => !existingEventExternalIds.includes(event.externalId),
    );

    const eventsToUpdate = formattedEvents.filter((event) =>
      existingEventExternalIds.includes(event.externalId),
    );

    const cancelledEventExternalIds = filteredEvents
      .filter((event) => event.status === 'cancelled')
      .map((event) => event.id as string);

    const calendarChannelEventAssociationsToSave = eventsToSave.map(
      (event) => ({
        calendarEventId: event.id,
        eventExternalId: event.externalId,
        calendarChannelId,
      }),
    );

    const participantsToSave = eventsToSave.flatMap(
      (event) => event.participants,
    );

    const participantsToUpdate = eventsToUpdate.flatMap(
      (event) => event.participants,
    );

    let newCalendarEventParticipants: CalendarEventParticipant[] = [];

    if (filteredEvents.length > 0) {
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
            `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: saving ${
              eventsToSave.length
            } events in ${endTime - startTime}ms.`,
          );

          startTime = Date.now();

          await this.calendarEventRepository.updateCalendarEvents(
            eventsToUpdate,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: updating ${
              eventsToUpdate.length
            } events in ${endTime - startTime}ms.`,
          );

          startTime = Date.now();

          await this.calendarChannelEventAssociationRepository.saveCalendarChannelEventAssociations(
            calendarChannelEventAssociationsToSave,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: saving calendar channel event associations in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          newCalendarEventParticipants =
            await this.calendarEventParticipantsRepository.updateCalendarEventParticipantsAndReturnNewOnes(
              participantsToUpdate,
              iCalUIDCalendarEventIdMap,
              workspaceId,
              transactionManager,
            );

          endTime = Date.now();

          participantsToSave.push(...newCalendarEventParticipants);

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: updating participants in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarEventParticipantsService.saveCalendarEventParticipants(
            participantsToSave,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: saving participants in ${
              endTime - startTime
            }ms.`,
          );

          startTime = Date.now();

          await this.calendarChannelEventAssociationRepository.deleteByEventExternalIdsAndCalendarChannelId(
            cancelledEventExternalIds,
            calendarChannelId,
            workspaceId,
            transactionManager,
          );

          endTime = Date.now();

          this.logger.log(
            `google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: deleting calendar channel event associations in ${
              endTime - startTime
            }ms.`,
          );
        });

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
          `Error during google calendar sync for workspace ${workspaceId} and account ${connectedAccountId}: ${error.message}`,
        );
      }
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
}
