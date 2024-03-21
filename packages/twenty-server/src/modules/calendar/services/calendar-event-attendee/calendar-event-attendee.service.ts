import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/getFlattenedValuesAndValuesStringForBatchRawQuery.util';
import { CalendarEventAttendeeWithId } from 'src/modules/calendar/types/calendar-event';

@Injectable()
export class CalendarEventAttendeeService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(PersonObjectMetadata)
    private readonly personRepository: PersonRepository,
  ) {}

  public async updateCalendarEventAttendeesAfterContactCreation(
    attendees: CalendarEventAttendeeWithId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (!attendees) return;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const handles = attendees.map((attendee) => attendee.handle);

    const attendeePersonIds = await this.personRepository.getByEmails(
      handles,
      workspaceId,
      transactionManager,
    );

    const calendarEventAttendeesToUpdate = attendees.map((attendee) => ({
      id: attendee.id,
      personId: attendeePersonIds.find(
        (e: { id: string; email: string }) => e.email === attendee.handle,
      )?.id,
    }));

    if (calendarEventAttendeesToUpdate.length === 0) return;

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(
        calendarEventAttendeesToUpdate,
        {
          id: 'uuid',
          personId: 'uuid',
        },
      );

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventAttendee" AS "calendarEventAttendee" SET "personId" = "data"."personId"
      FROM (VALUES ${valuesString}) AS "data"("id", "personId")
      WHERE "calendarEventAttendee"."id" = "data"."id"`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }
}
