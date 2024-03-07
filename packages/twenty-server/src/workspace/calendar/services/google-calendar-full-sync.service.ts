import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FetchCalendarsByBatchesService } from 'src/workspace/messaging/services/fetch-calendars-by-batches.service';
import { CalendarQueue } from 'src/integrations/calendar-queue/calendar-queue.constants';
import { CalendarQueueService } from 'src/integrations/calendar-queue/services/calendar-queue.service';
import {
  GmailFullSyncJobData,
  GmailFullSyncJob,
} from 'src/workspace/messaging/jobs/gmail-full-sync.job';
import { ConnectedAccountService } from 'src/workspace/calendar-and-messaging/repositories/connected-account/connected-account.service';
import { CalendarChannelService } from 'src/workspace/messaging/repositories/calendar-channel/calendar-channel.service';
import { CalendarChannelEventAssociationService } from 'src/workspace/messaging/repositories/calendar-channel-calendar-association/calendar-channel-calendar-association.service';
import { BlocklistService } from 'src/workspace/calendar-and-messaging/repositories/blocklist/blocklist.service';
import { SaveCalendarsAndCreateContactsService } from 'src/workspace/messaging/services/save-calendars-and-create-contacts.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { GoogleCalendarClientProvider } from 'src/workspace/calendar/services/providers/google-calendar/google-calendar.provider';
import { googleCalendarSearchFilterExcludeEmails } from 'src/workspace/calendar/utils/google-calendar-search-filter.util';

@Injectable()
export class GmailFullSyncService {
  private readonly logger = new Logger(GmailFullSyncService.name);

  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
    private readonly fetchCalendarsByBatchesService: FetchCalendarsByBatchesService,
    @Inject(CalendarQueue.messagingQueue)
    private readonly calendarQueueService: CalendarQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly calendarChannelService: CalendarChannelService,
    private readonly calendarChannelEventAssociationService: CalendarChannelEventAssociationService,
    private readonly blocklistService: BlocklistService,
    private readonly saveCalendarsAndCreateContactsService: SaveCalendarsAndCreateContactsService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  public async startGoogleCalendarFullSync(
    workspaceId: string,
    connectedAccountId: string,
    pageToken?: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountService.getByIdOrFail(
      connectedAccountId,
      workspaceId,
    );

    const accessToken = connectedAccount.accessToken;
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

    const eventExternalIds = events.map((event) => event.id);

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

    // TODO: When we will be able to add unicity contraint on iCalUID, we will do a INSERT ON CONFLICT DO UPDATE

    const existingEventExternalIds =
      existingCalendarChannelEventAssociations.map(
        (association) => association.eventExternalId,
      );

    const eventsToSave = events.filter(
      (event) => !existingEventExternalIds.includes(event.id),
    );

    const eventsToUpdate = events.filter((event) =>
      existingEventExternalIds.includes(event.id),
    );

    if (events.length > 0) {
      // this.calendarEventsService.saveEvents();
      // this.calendarEventAttendeesService.saveEventAttendees();
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

    await this.calendarChannelService.updateSyncCursor(
      nextSyncToken,
      connectedAccount.id,
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

    if (nextPageToken) {
      await this.calendarQueueService.add<GmailFullSyncJobData>(
        GmailFullSyncJob.name,
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
