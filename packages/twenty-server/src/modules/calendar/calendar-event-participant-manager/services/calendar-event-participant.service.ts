import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { isDefined } from 'class-validator';
import differenceWith from 'lodash.differencewith';
import { Any } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/calendar-event';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CalendarEventParticipantService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async upsertAndDeleteCalendarEventParticipants(
    participantsToSave: CalendarEventParticipantWithCalendarEventId[],
    participantsToUpdate: CalendarEventParticipantWithCalendarEventId[],
    workspaceId: string,
    transactionManager?: any,
  ): Promise<void> {
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

    const { calendarEventParticipantsToUpdate, newCalendarEventParticipants } =
      participantsToUpdate.reduce(
        (acc, calendarEventParticipant) => {
          const existingCalendarEventParticipant =
            existingCalendarEventParticipants.find(
              (existingCalendarEventParticipant) =>
                existingCalendarEventParticipant.handle ===
                  calendarEventParticipant.handle &&
                existingCalendarEventParticipant.calendarEventId ===
                  calendarEventParticipant.calendarEventId,
            );

          if (existingCalendarEventParticipant) {
            acc.calendarEventParticipantsToUpdate.push(
              calendarEventParticipant,
            );
          } else {
            acc.newCalendarEventParticipants.push(calendarEventParticipant);
          }

          return acc;
        },
        {
          calendarEventParticipantsToUpdate:
            [] as CalendarEventParticipantWithCalendarEventId[],
          newCalendarEventParticipants:
            [] as CalendarEventParticipantWithCalendarEventId[],
        },
      );

    const calendarEventParticipantsToDelete = differenceWith(
      existingCalendarEventParticipants,
      participantsToUpdate,
      (existingCalendarEventParticipant, participantToUpdate) =>
        existingCalendarEventParticipant.handle ===
          participantToUpdate.handle &&
        existingCalendarEventParticipant.calendarEventId ===
          participantToUpdate.calendarEventId,
    );

    await calendarEventParticipantRepository.delete(
      {
        id: Any(
          calendarEventParticipantsToDelete.map(
            (calendarEventParticipant) => calendarEventParticipant.id,
          ),
        ),
      },
      transactionManager,
    );

    for (const calendarEventParticipantToUpdate of calendarEventParticipantsToUpdate) {
      await calendarEventParticipantRepository.update(
        {
          calendarEventId: calendarEventParticipantToUpdate.calendarEventId,
          handle: calendarEventParticipantToUpdate.handle,
        },
        {
          ...calendarEventParticipantToUpdate,
        },
        transactionManager,
      );
    }

    participantsToSave.push(...newCalendarEventParticipants);

    await calendarEventParticipantRepository.save(
      participantsToSave,
      {},
      transactionManager,
    );

    await this.matchCalendarEventParticipants(
      participantsToSave,
      workspaceId,
      transactionManager,
    );
  }

  private async matchCalendarEventParticipants(
    calendarEventParticipants: CalendarEventParticipantWithCalendarEventId[],
    workspaceId: string,
    transactionManager?: any,
  ) {
    const uniqueParticipantsHandles = [
      ...new Set(
        calendarEventParticipants.map((participant) => participant.handle),
      ),
    ];

    const calendarEventParticipantRepository =
      await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    const personRepository =
      await this.twentyORMManager.getRepository<PersonWorkspaceEntity>(
        'person',
      );

    const persons = await personRepository.find(
      {
        where: {
          email: Any(uniqueParticipantsHandles),
        },
      },
      transactionManager,
    );

    const workspaceMemberRepository =
      await this.twentyORMManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
      );

    const workspaceMembers = await workspaceMemberRepository.find(
      {
        where: {
          userEmail: Any(uniqueParticipantsHandles),
        },
      },
      transactionManager,
    );

    for (const handle of uniqueParticipantsHandles) {
      const person = persons.find((person) => person.email === handle);

      const workspaceMember = workspaceMembers.find(
        (workspaceMember) => workspaceMember.userEmail === handle,
      );

      await calendarEventParticipantRepository.update(
        {
          handle,
        },
        {
          personId: person?.id,
          workspaceMemberId: workspaceMember?.id,
        },
        transactionManager,
      );
    }

    this.eventEmitter.emit(`calendarEventParticipant.matched`, {
      workspaceId,
      workspaceMemberId: null,
      calendarEventParticipants,
    });
  }

  public async matchCalendarEventParticipantsAfterPersonOrWorkspaceMemberCreation(
    handle: string,
    workspaceId: string,
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
          handle,
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
