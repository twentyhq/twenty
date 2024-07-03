import { Injectable, Logger } from '@nestjs/common';

import { calendar_v3 as calendarV3 } from 'googleapis';
import { GaxiosError } from 'gaxios';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/providers/google-calendar.provider';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@Injectable()
export class GoogleCalendarGetEventsService {
  private readonly logger = new Logger(GoogleCalendarGetEventsService.name);

  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
  ) {}

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
              connectedAccountId: connectedAccount.id,
            },
            {
              syncCursor: '',
            },
          );

          //   this.logger.log(
          //     `Sync token is no longer valid for connected account ${connectedAccount.id} in workspace ${workspaceId}, resetting sync cursor.`,
          //   );

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

    return { events, nextSyncToken };
  }
}
