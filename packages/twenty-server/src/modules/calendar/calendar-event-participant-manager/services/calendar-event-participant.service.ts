import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { isDefined } from 'class-validator';
import { Any, EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/calendar-messaging-participant-manager/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/calendar-event-import-manager/utils/get-flattened-values-and-values-string-for-batch-raw-query.util';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import {
  CalendarEventParticipant,
  CalendarEventParticipantWithCalendarEventId,
} from 'src/modules/calendar/common/types/calendar-event';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class CalendarEventParticipantService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(PersonWorkspaceEntity)
    private readonly personRepository: PersonRepository,
    private readonly addPersonIdAndWorkspaceMemberIdService: AddPersonIdAndWorkspaceMemberIdService,
    private readonly eventEmitter: EventEmitter2,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async updateCalendarEventParticipantsAfterPeopleCreation(
    createdPeople: PersonWorkspaceEntity[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<CalendarEventParticipantWorkspaceEntity[]> {
    const calendarEventParticipantRepository =
      await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    const participants = await calendarEventParticipantRepository.find({
      where: {
        handle: Any(createdPeople.map((person) => person.email)),
      },
    });

    if (!participants) return [];

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

    if (calendarEventParticipantsToUpdate.length === 0) return [];

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(
        calendarEventParticipantsToUpdate,
        {
          id: 'uuid',
          personId: 'uuid',
        },
      );

    return (
      await this.workspaceDataSourceService.executeRawQuery(
        `UPDATE ${dataSourceSchema}."calendarEventParticipant" AS "calendarEventParticipant" SET "personId" = "data"."personId"
      FROM (VALUES ${valuesString}) AS "data"("id", "personId")
      WHERE "calendarEventParticipant"."id" = "data"."id"
      RETURNING *`,
        flattenedValues,
        workspaceId,
        transactionManager,
      )
    ).flat();
  }

  public async saveCalendarEventParticipants(
    calendarEventParticipants: CalendarEventParticipant[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<CalendarEventParticipantWorkspaceEntity[]> {
    if (calendarEventParticipants.length === 0) {
      return [];
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
          responseStatus: `${dataSourceSchema}."calendarEventParticipant_responseStatus_enum"`,
          personId: 'uuid',
          workspaceMemberId: 'uuid',
        },
      );

    return await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."calendarEventParticipant" ("calendarEventId", "handle", "displayName", "isOrganizer", "responseStatus", "personId", "workspaceMemberId") VALUES ${valuesString}
      RETURNING *`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }

  public async upsertAndDeleteCalendarEventParticipants(
    participantsToSave: CalendarEventParticipantWithCalendarEventId[],
    participantsToUpdate: CalendarEventParticipantWithCalendarEventId[],
    workspaceId: string,
    transactionManager?: any,
  ): Promise<CalendarEventParticipantWorkspaceEntity[]> {
    const calendarEventParticipantRepository =
      await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    const existingCalendarEventParticipants =
      await calendarEventParticipantRepository.find({
        where: {
          calendarEventId: Any(
            participantsToUpdate
              .map((participant) => participant.calendarEventId)
              .filter(isDefined),
          ),
        },
      });

    const { calendarEventParticipantsToDelete, newCalendarEventParticipants } =
      participantsToUpdate.reduce(
        (acc, calendarEventParticipant) => {
          const existingCalendarEventParticipant =
            existingCalendarEventParticipants.find(
              (existingCalendarEventParticipant) =>
                existingCalendarEventParticipant.handle ===
                calendarEventParticipant.handle,
            );

          if (existingCalendarEventParticipant) {
            acc.calendarEventParticipantsToDelete.push(
              existingCalendarEventParticipant,
            );
          } else {
            acc.newCalendarEventParticipants.push(calendarEventParticipant);
          }

          return acc;
        },
        {
          calendarEventParticipantsToDelete:
            [] as CalendarEventParticipantWorkspaceEntity[],
          newCalendarEventParticipants:
            [] as CalendarEventParticipantWithCalendarEventId[],
        },
      );

    await calendarEventParticipantRepository.delete({
      id: Any(
        calendarEventParticipantsToDelete.map(
          (calendarEventParticipant) => calendarEventParticipant.id,
        ),
      ),
    });

    await calendarEventParticipantRepository.save(participantsToUpdate);

    participantsToSave.push(...newCalendarEventParticipants);

    return await this.saveCalendarEventParticipants(
      participantsToSave,
      workspaceId,
      transactionManager,
    );
  }

  public async matchCalendarEventParticipants(
    workspaceId: string,
    email: string,
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const calendarEventParticipantRepository =
      await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    const calendarEventParticipantsToUpdate =
      await calendarEventParticipantRepository.find({
        where: {
          handle: email,
        },
      });

    const calendarEventParticipantIdsToUpdate =
      calendarEventParticipantsToUpdate.map((participant) => participant.id);

    if (personId) {
      await calendarEventParticipantRepository.update(
        {
          id: Any(calendarEventParticipantIdsToUpdate),
        },
        {
          person: {
            id: personId,
          },
        },
      );

      const updatedCalendarEventParticipants =
        await calendarEventParticipantRepository.find({
          where: {
            id: Any(calendarEventParticipantIdsToUpdate),
          },
        });

      this.eventEmitter.emit(`calendarEventParticipant.matched`, {
        workspaceId,
        workspaceMemberId: null,
        calendarEventParticipants: updatedCalendarEventParticipants,
      });
    }
    if (workspaceMemberId) {
      await calendarEventParticipantRepository.update(
        {
          id: Any(calendarEventParticipantIdsToUpdate),
        },
        {
          workspaceMember: {
            id: workspaceMemberId,
          },
        },
      );
    }
  }

  public async unmatchCalendarEventParticipants(
    workspaceId: string,
    handle: string,
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const calendarEventParticipantRepository =
      await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    if (personId) {
      await calendarEventParticipantRepository.update(
        {
          handle,
        },
        {
          person: null,
        },
      );
    }
    if (workspaceMemberId) {
      await calendarEventParticipantRepository.update(
        {
          handle,
        },
        {
          workspaceMember: null,
        },
      );
    }
  }
}
