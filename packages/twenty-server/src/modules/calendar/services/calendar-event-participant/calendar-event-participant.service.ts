import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/getFlattenedValuesAndValuesStringForBatchRawQuery.util';
import {
  CalendarEventParticipant,
  CalendarEventParticipantWithId,
} from 'src/modules/calendar/types/calendar-event';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/connected-account/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';

@Injectable()
export class CalendarEventParticipantService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(PersonObjectMetadata)
    private readonly personRepository: PersonRepository,
    private readonly addPersonIdAndWorkspaceMemberIdService: AddPersonIdAndWorkspaceMemberIdService,
  ) {}

  public async updateCalendarEventParticipantsAfterContactCreation(
    participants: CalendarEventParticipantWithId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const handles = participants.map((participant) => participant.handle);

    const participantPersonIds = await this.personRepository.getByEmails(
      handles,
      workspaceId,
      transactionManager,
    );

    const calendarEventParticipantsToUpdate = participants.map(
      (participant) => ({
        id: participant.id,
        personId: participantPersonIds.find(
          (e: { id: string; email: string }) => e.email === participant.handle,
        )?.id,
      }),
    );

    if (calendarEventParticipantsToUpdate.length === 0) return;

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(
        calendarEventParticipantsToUpdate,
        {
          id: 'uuid',
          personId: 'uuid',
        },
      );

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventParticipant" AS "calendarEventParticipant" SET "personId" = "data"."personId"
      FROM (VALUES ${valuesString}) AS "data"("id", "personId")
      WHERE "calendarEventParticipant"."id" = "data"."id"`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }

  public async saveCalendarEventParticipants(
    calendarEventParticipants: CalendarEventParticipant[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (calendarEventParticipants.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEventParticipantsToSave =
      await this.addPersonIdAndWorkspaceMemberIdService.addPersonIdAndWorkspaceMemberId(
        calendarEventParticipants,
        workspaceId,
        transactionManager,
      );

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(
        calendarEventParticipantsToSave,
        {
          calendarEventId: 'uuid',
          handle: 'text',
          displayName: 'text',
          isOrganizer: 'boolean',
          responseStatus: `${dataSourceSchema}."calendarEventParticipant_responsestatus_enum"`,
          personId: 'uuid',
          workspaceMemberId: 'uuid',
        },
      );

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."calendarEventParticipant" ("calendarEventId", "handle", "displayName", "isOrganizer", "responseStatus", "personId", "workspaceMemberId") VALUES ${valuesString}`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }
}
