import { Injectable, Logger } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import { AddressObject } from 'mailparser';

import { FetchByBatchesService } from 'src/workspace/calendar-and-messaging/services/fetch-by-batch.service';
import { BatchQueries } from 'src/workspace/calendar-and-messaging/types/batch-queries';
import { CalendarEvent } from 'src/workspace/calendar/types/calendar-event';
import { CalendarEventFromGoogleParsedResponse } from 'src/workspace/calendar/types/calendar-event-from-google-parsed-response';
import { Participant } from 'src/workspace/messaging/types/gmail-message';

@Injectable()
export class FetchCalendarEventsByBatchesService {
  private readonly logger = new Logger(
    FetchCalendarEventsByBatchesService.name,
  );

  constructor(private readonly fetchByBatchesService: FetchByBatchesService) {}

  async fetchAllEvents(
    queries: BatchQueries,
    accessToken: string,
    jobName?: string,
    workspaceId?: string,
    connectedAccountId?: string,
  ): Promise<{ calendarEvents: CalendarEvent[]; errors: any[] }> {
    let startTime = Date.now();
    const batchResponses = await this.fetchByBatchesService.fetchAllByBatches(
      queries,
      accessToken,
      'batch_calendar_events',
    );
    let endTime = Date.now();

    this.logger.log(
      `${jobName} for workspace ${workspaceId} and account ${connectedAccountId} fetching ${
        queries.length
      } calendarEvents in ${endTime - startTime}ms`,
    );

    startTime = Date.now();

    const formattedResponse =
      await this.formatBatchResponsesAsCalendarEvents(batchResponses);

    endTime = Date.now();

    this.logger.log(
      `${jobName} for workspace ${workspaceId} and account ${connectedAccountId} formatting ${
        queries.length
      } calendarEvents in ${endTime - startTime}ms`,
    );

    return formattedResponse;
  }

  async formatBatchResponseAsCalendarEvent(
    responseCollection: AxiosResponse<any, any>,
  ): Promise<{
    calendarEvents: CalendarEventFromGoogleParsedResponse[];
    errors: any[];
  }> {
    const parsedResponses = this.fetchByBatchesService.parseBatch(
      responseCollection,
    ) as CalendarEventFromGoogleParsedResponse[];

    const errors: any = [];

    const formattedResponse = Promise.all(
      parsedResponses.map(
        async (calendar: CalendarEventFromGoogleParsedResponse) => {
          // if (calendar.error) {
          //   console.log('Error', calendar.error);

          //   errors.push(calendar.error);

          //   return;
          // }

          // const { historyId, id, threadId, internalDate, raw } = calendar;

          // const body = atob(raw?.replace(/-/g, '+').replace(/_/g, '/'));

          try {
            // const parsed = await simpleParser(body, {
            //   skipHtmlToText: true,
            //   skipImageLinks: true,
            //   skipTextToHtml: true,
            //   maxHtmlLengthToParse: 0,
            // });
            // const { subject, calendarId, from, to, cc, bcc, text, attachments } =
            //   parsed;
            // if (!from) throw new Error('From value is missing');
            // const participants = [
            //   ...this.formatAddressObjectAsParticipants(from, 'from'),
            //   ...this.formatAddressObjectAsParticipants(to, 'to'),
            //   ...this.formatAddressObjectAsParticipants(cc, 'cc'),
            //   ...this.formatAddressObjectAsParticipants(bcc, 'bcc'),
            // ];
            // let textWithoutReplyQuotations = text;
            // if (text)
            //   try {
            //     textWithoutReplyQuotations = planer.extractFrom(
            //       text,
            //       'text/plain',
            //     );
            //   } catch (error) {
            //     console.log(
            //       'Error while trying to remove reply quotations',
            //       error,
            //     );
            //   }
            // TODO: Implement the rest of the function
            return calendar;
          } catch (error) {
            console.log('Error', error);

            errors.push(error);
          }
        },
      ),
    );

    const filteredCalendarEvents = (await formattedResponse).filter(
      (calendar) => calendar,
    ) as CalendarEvent[];

    return { calendarEvents: filteredCalendarEvents, errors };
  }

  formatAddressObjectAsArray(
    addressObject: AddressObject | AddressObject[],
  ): AddressObject[] {
    return Array.isArray(addressObject) ? addressObject : [addressObject];
  }

  formatAddressObjectAsParticipants(
    addressObject: AddressObject | AddressObject[] | undefined,
    role: 'from' | 'to' | 'cc' | 'bcc',
  ): Participant[] {
    if (!addressObject) return [];
    const addressObjects = this.formatAddressObjectAsArray(addressObject);

    const participants = addressObjects.map((addressObject) => {
      const emailAdresses = addressObject.value;

      return emailAdresses.map((emailAddress) => {
        const { name, address } = emailAddress;

        return {
          role,
          handle: address?.toLowerCase() || '',
          displayName: name || '',
        };
      });
    });

    return participants.flat();
  }

  async formatBatchResponsesAsCalendarEvents(
    batchResponses: AxiosResponse<any, any>[],
  ): Promise<{ calendarEvents: CalendarEvent[]; errors: any[] }> {
    const calendarEventsAndErrors = await Promise.all(
      batchResponses.map(async (response) => {
        return this.formatBatchResponseAsCalendarEvent(response);
      }),
    );

    const calendarEvents = calendarEventsAndErrors
      .map((item) => item.calendarEvents)
      .flat();

    const errors = calendarEventsAndErrors.map((item) => item.errors).flat();

    return { calendarEvents, errors };
  }
}
