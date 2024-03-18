import { Injectable } from '@nestjs/common';

import { groupBy } from 'lodash.groupBy';

import { TIMELINE_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventAttendee } from 'src/engine/modules/calendar/dtos/timeline-calendar-event-attendee.dto';
import { TimelineCalendarEvent } from 'src/engine/modules/calendar/dtos/timeline-calendar-event.dto';
import { TimelineCalendarEventsWithTotal } from 'src/engine/modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

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
    pageSize: number = TIMELINE_EVENTS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineCalendarEventsWithTotal> {
    const offset = (page - 1) * pageSize;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEvents: Omit<TimelineCalendarEvent, 'attendees'>[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT
      "calendarEvent".*,
      FROM ${dataSourceSchema}."calendarEvent" "calendarEvent"
      INNER JOIN ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee" ON "calendarEvent".id = "calendarEventAttendee"."calendarEventId"
      WHERE "calendarEventAttendee"."personId" IN ANY($1)
      GROUP BY "calendarEvent".id,
      ORDER BY "calendarEvent"."startDateTime" DESC
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

    const calendarEventAttendees: TimelineCalendarEventAttendee[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT *
      FROM ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee"
      WHERE "calendarEventAttendee"."calendarEventId" IN ANY($1)`,
        [calendarEvents.map((event) => event.id)],
        workspaceId,
      );

    const calendarEventAttendeesByEventId: {
      [calendarEventId: string]: TimelineCalendarEventAttendee[];
    } = groupBy(calendarEventAttendees, 'calendarEventId');

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
          visibility: 'metadata' | 'subject' | 'share_everything';
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

    if (calendarEventVisibility) {
      timelineCalendarEvents.forEach((event) => {
        const visibility = calendarEventVisibility.find(
          (visibility) => visibility.calendarEventId === event.id,
        );

        if (!visibility) {
          return;
        }

        event.visibility = visibility.visibility;

        if (visibility.visibility === 'metadata') {
          event.subject = null;
        }
      });
    }

    return {
      totalNumberOfCalendarEvents: totalNumberOfCalendarEvents[0].count,
      timelineCalendarEvents,
    };
  }
}
