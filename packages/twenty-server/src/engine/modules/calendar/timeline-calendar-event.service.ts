import { Injectable } from '@nestjs/common';

import { groupBy } from 'lodash.groupBy';

import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventAttendee } from 'src/engine/modules/calendar/dtos/timeline-calendar-event-attendee.dto';
import { TimelineCalendarEvent } from 'src/engine/modules/calendar/dtos/timeline-calendar-event.dto';
import { TimelineCalendarEventsWithTotal } from 'src/engine/modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { maxVisibility } from 'src/engine/modules/calendar/utils/max-visibility.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CalendarEventAttendeeObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-attendee.object-metadata';

type TimelineCalendarEventAttendeeWithPersonInformation =
  ObjectRecord<CalendarEventAttendeeObjectMetadata> & {
    personFirstName: string;
    personLastName: string;
    personAvatarUrl: string;
    workspaceMemberFirstName: string;
    workspaceMemberLastName: string;
    workspaceMemberAvatarUrl: string;
  };
@Injectable()
export class TimelineCalendarEventService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async getCalendarEventsFromPersonIds(
    workspaceMemberId: string,
    workspaceId: string,
    personIds: string[],
    page: number = 1,
    pageSize: number = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineCalendarEventsWithTotal> {
    const offset = (page - 1) * pageSize;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEvents: Omit<TimelineCalendarEvent, 'attendees'>[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT
            "calendarEvent".*,
            FROM
                ${dataSourceSchema}."calendarEvent" "calendarEvent"
            LEFT JOIN
                ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee" ON "calendarEvent".id = "calendarEventAttendee"."calendarEventId"
            LEFT JOIN
                ${dataSourceSchema}."person" "person" ON "calendarEventAttendee"."personId" = "person".id
            WHERE
                "calendarEventAttendee"."personId" IN ANY($1)
            GROUP BY
                "calendarEvent".id,
            ORDER BY
                "calendarEvent"."startDateTime" DESC
            LIMIT $2
            OFFSET $3`,
        [personIds, pageSize, offset],
        workspaceId,
      );

    if (!calendarEvents) {
      return {
        totalNumberOfCalendarEvents: 0,
        timelineCalendarEvents: [],
      };
    }

    const calendarEventAttendees: TimelineCalendarEventAttendeeWithPersonInformation[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT
            "calendarEventAttendee".*,
            "person"."nameFirstName" as "personFirstName",
            "person"."nameLastName" as "personLastName",
            "person"."avatarUrl" as "personAvatarUrl",
            "workspaceMember"."nameFirstName" as "workspaceMemberFirstName",
            "workspaceMember"."nameLastName" as "workspaceMemberLastName",
            "workspaceMember"."avatarUrl" as "workspaceMemberAvatarUrl",
        FROM
            ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee"
        LEFT JOIN
            ${dataSourceSchema}."person" "person" ON "calendarEventAttendee"."personId" = "person".id
        LEFT JOIN
            ${dataSourceSchema}."workspaceMember" "workspaceMember" ON "calendarEventAttendee"."workspaceMemberId" = "workspaceMember".id
        WHERE
            "calendarEventAttendee"."calendarEventId" IN ANY($1)`,
        [calendarEvents.map((event) => event.id)],
        workspaceId,
      );

    const formattedCalendarEventAttendees: TimelineCalendarEventAttendee[] =
      calendarEventAttendees.map((attendee) => {
        const firstName =
          attendee.personFirstName || attendee.workspaceMemberFirstName || '';

        const lastName =
          attendee.personLastName || attendee.workspaceMemberLastName || '';

        const displayName =
          firstName || attendee.displayName || attendee.handle;

        const avatarUrl =
          attendee.personAvatarUrl || attendee.workspaceMemberAvatarUrl || '';

        return {
          personId: attendee.personId,
          workspaceMemberId: attendee.workspaceMemberId,
          firstName,
          lastName,
          displayName,
          avatarUrl,
          handle: attendee.handle,
        };
      });

    const calendarEventAttendeesByEventId: {
      [calendarEventId: string]: TimelineCalendarEventAttendee[];
    } = groupBy(formattedCalendarEventAttendees, 'calendarEventId');

    const totalNumberOfCalendarEvents: { count: number }[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `
      SELECT COUNT(DISTINCT "calendarEventId")
      FROM ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee"
      WHERE "calendarEventAttendee"."personId" IN ANY($1)
      `,
        [personIds],
        workspaceId,
      );

    const timelineCalendarEvents = calendarEvents.map((event) => {
      const attendees = calendarEventAttendeesByEventId[event.id] || [];

      return {
        ...event,
        attendees,
      };
    });

    const calendarEventVisibility:
      | {
          calendarEventId: string;
          visibility: 'METADATA' | 'SHARE_EVERYTHING';
        }[]
      | undefined = await this.workspaceDataSourceService.executeRawQuery(
      `
      SELECT
          "calendarEvent".id AS "calendarEventId",
          "calendarChannel"."visibility"
      FROM
          ${dataSourceSchema}."calendarChannel" "calendarChannel"
      LEFT JOIN
          ${dataSourceSchema}."calendarChannelEventAssociation" "calendarChannelEventAssociation" ON "calendarChannel".id = "calendarChannelEventAssociation"."calendarChannelId"
      WHERE
          "calendarEvent".id = ANY($1)
      `,
      [timelineCalendarEvents.map((event) => event.id)],
      workspaceId,
    );

    if (!calendarEventVisibility) {
      throw new Error('Failed to fetch calendar event visibility');
    }

    const calendarEventVisibilityByEventId: {
      [calendarEventId: string]: string;
    } = calendarEventVisibility.reduce(
      (acc, { calendarEventId, visibility }) => {
        acc[calendarEventId] = maxVisibility(
          acc[calendarEventId] || 'METADATA',
          visibility,
        );

        return acc;
      },
      {},
    );

    timelineCalendarEvents.forEach((event) => {
      event.visibility = calendarEventVisibilityByEventId[event.id];

      if (event.visibility === 'METADATA') {
        event.title = '';
        event.description = '';
        event.location = '';
        event.conferenceSolution = '';
        event.conferenceUri = '';
      }
    });

    return {
      totalNumberOfCalendarEvents: totalNumberOfCalendarEvents[0].count,
      timelineCalendarEvents,
    };
  }
}
