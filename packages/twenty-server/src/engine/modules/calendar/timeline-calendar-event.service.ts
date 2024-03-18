import { Injectable } from '@nestjs/common';

import { groupBy } from 'lodash.groupBy';

import { TIMELINE_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/modules/calendar/constants/calendar.constants';
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

    const calendarEvents =
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

    const calendarEventAttendees =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT *
      FROM ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee"
      WHERE "calendarEventAttendee"."calendarEventId" IN ANY($1)`,
        [calendarEvents.map((event) => event.id)],
        workspaceId,
      );

    const calendarEventAttendeesByEventId = groupBy(
      calendarEventAttendees,
      'calendarEventId',
    );

    const totalNumberOfCalendarEvents =
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

    return {
      totalNumberOfCalendarEvents: totalNumberOfCalendarEvents[0].count,
      timelineCalendarEvents,
    };
  }
}
