import { Injectable } from '@nestjs/common';

import { GaxiosError } from 'gaxios';
import { calendar_v3 as calendarV3 } from 'googleapis';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/providers/google-calendar.provider';
import { formatGoogleCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/format-google-calendar-event.util';
import { GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class GoogleCalendarGetEventsService {
  constructor(
    private readonly googleCalendarClientProvider: GoogleCalendarClientProvider,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    const googleCalendarClient =
      await this.googleCalendarClientProvider.getGoogleCalendarClient(
        connectedAccount,
      );

    let nextSyncToken: string | null | undefined;
    let nextPageToken: string | undefined;
    const events: calendarV3.Schema$Event[] = [];

    let hasMoreEvents = true;

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    while (hasMoreEvents) {
      const googleCalendarEvents = await googleCalendarClient.events
        .list({
          calendarId: 'primary',
          maxResults: 500,
          syncToken: syncCursor,
          pageToken: nextPageToken,
          showDeleted: true,
        })
        .catch(async (error: GaxiosError) => {
          if (error.response?.status !== 410) {
            throw error;
          }

          await calendarChannelRepository.update(
            {
              connectedAccountId: connectedAccount.id,
            },
            {
              syncCursor: '',
            },
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

    return {
      calendarEvents: formatGoogleCalendarEvents(events),
      nextSyncCursor: nextSyncToken || '',
    };
  }
}
