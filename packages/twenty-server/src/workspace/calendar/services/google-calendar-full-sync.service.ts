import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ConnectedAccountService } from 'src/workspace/calendar-and-messaging/repositories/connected-account/connected-account.service';
import { BlocklistService } from 'src/workspace/calendar-and-messaging/repositories/blocklist/blocklist.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { GoogleCalendarClientProvider } from 'src/workspace/calendar/services/providers/google-calendar/google-calendar.provider';
import { googleCalendarSearchFilterExcludeEmails } from 'src/workspace/calendar/utils/google-calendar-search-filter.util';
import { CalendarChannelEventAssociationService } from 'src/workspace/calendar/repositories/calendar-channel-event-association/calendar-channel-event-association.service';
import { CalendarChannelService } from 'src/workspace/calendar/repositories/calendar-channel/calendar-channel.service';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { CalendarEventService } from 'src/workspace/calendar/repositories/calendar-event/calendar-event.service';
import { formatGoogleCalendarEvent } from 'src/workspace/calendar/utils/format-google-calendar-event.util';
import { GoogleCalendarFullSyncJobData } from 'src/workspace/calendar/jobs/google-calendar-full-sync.job';
import { CalendarEventAttendeeService } from 'src/workspace/calendar/repositories/calendar-event-attendee/calendar-event-attendee.service';

@Injectable()
export class GoogleCalendarFullSyncService {
  private readonly logger = new Logger(GoogleCalendarFullSyncService.name);

  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
    @Inject(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly calendarEventService: CalendarEventService,
    private readonly calendarChannelService: CalendarChannelService,
    private readonly calendarChannelEventAssociationService: CalendarChannelEventAssociationService,
    private readonly calendarEventAttendeesService: CalendarEventAttendeeService,
    private readonly blocklistService: BlocklistService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async startGoogleCalendarFullSync(
    workspaceId: string,
    connectedAccountId: string,
    pageToken?: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountService.getById(
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
      await this.calendarChannelService.getFirstByConnectedAccountIdOrFail(
        connectedAccountId,
        workspaceId,
      );

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
      ? await this.blocklistService.getByWorkspaceMemberId(
          workspaceMemberId,
          workspaceId,
        )
      : [];

    const blocklistedEmails = blocklist.map((blocklist) => blocklist.handle);
    let startTime = Date.now();

    const googleCalendarEvents = await googleCalendarClient.events.list({
      calendarId: 'primary',
      maxResults: 500,
      pageToken: pageToken,
      q: googleCalendarSearchFilterExcludeEmails(blocklistedEmails),
    });

    let endTime = Date.now();

    this.logger.log(
      `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId} getting events list in ${
        endTime - startTime
      }ms.`,
    );

    const {
      items: events,
      nextPageToken,
      nextSyncToken,
    } = googleCalendarEvents.data;

    if (!events || events?.length === 0) {
      this.logger.log(
        `google calendar full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    const eventExternalIds = events.map((event) => event.id as string);

    startTime = Date.now();

    const existingCalendarChannelEventAssociations =
      await this.calendarChannelEventAssociationService.getByEventExternalIdsAndCalendarChannelId(
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

    // TODO: In V2, we will also import deleted events by doing batch GET queries on the canceled events
    // The canceled events start and end are not accessible in the list query
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
      await this.calendarEventService.getICalUIDCalendarEventIdMap(
        eventsToUpdate.map((event) => event.iCalUID),
        workspaceId,
      );

    if (events.length > 0) {
      const dataSourceMetadata =
        await this.workspaceDataSourceService.connectToWorkspaceDataSource(
          workspaceId,
        );

      dataSourceMetadata?.transaction(async (transactionManager) => {
        this.calendarEventService.saveCalendarEvents(
          eventsToSave,
          workspaceId,
          transactionManager,
        );

        this.calendarEventService.updateCalendarEvents(
          eventsToUpdate,
          workspaceId,
          transactionManager,
        );

        this.calendarChannelEventAssociationService.saveCalendarChannelEventAssociations(
          calendarChannelEventAssociationsToSave,
          workspaceId,
          transactionManager,
        );

        this.calendarEventAttendeesService.saveCalendarEventAttendees(
          attendeesToSave,
          workspaceId,
          transactionManager,
        );

        this.calendarEventAttendeesService.updateCalendarEventAttendees(
          attendeesToUpdate,
          iCalUIDCalendarEventIdMap,
          workspaceId,
          transactionManager,
        );
      });
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

    // await this.calendarChannelService.updateSyncCursor(
    //   nextSyncToken,
    //   connectedAccount.id,
    //   workspaceId,
    // );

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

    if (nextPageToken) {
      await this.messageQueueService.add<GoogleCalendarFullSyncJobData>(
        GoogleCalendarFullSyncService.name,
        {
          workspaceId,
          connectedAccountId,
          nextPageToken,
        },
        {
          retryLimit: 2,
        },
      );
    }
  }
}
