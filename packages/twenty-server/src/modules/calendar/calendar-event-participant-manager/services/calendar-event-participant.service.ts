import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import differenceWith from 'lodash.differencewith';
import { Any } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/calendar-event';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

@Injectable()
export class CalendarEventParticipantService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly matchParticipantService: MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
  ) {}

  public async upsertAndDeleteCalendarEventParticipants(
    participantsToSave: CalendarEventParticipantWithCalendarEventId[],
    participantsToUpdate: CalendarEventParticipantWithCalendarEventId[],
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

    const savedParticipants = await calendarEventParticipantRepository.save(
      participantsToSave,
      {},
      transactionManager,
    );

    await this.matchParticipantService.matchParticipants(
      savedParticipants,
      'calendarEventParticipant',
      transactionManager,
    );
  }
}
