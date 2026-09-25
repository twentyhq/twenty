import {
  createInMemoryWorkspaceRepository,
  type InMemoryRecord,
} from 'test/utils/create-in-memory-workspace-repository.util';

import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE } from 'src/modules/calendar/calendar-event-participant-manager/constants/calendar-event-participant-chunk-size';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

const buildParticipants = (count: number, prefix: string): InMemoryRecord[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${String(index).padStart(6, '0')}`,
    calendarEventId: 'calendar-event',
    deletedAt: null,
  }));

const getIds = (records: InMemoryRecord[]) =>
  records.map(({ id }) => id).sort();

describe('CalendarEventParticipantService', () => {
  describe('writeCalendarEventParticipants', () => {
    const writeParticipants = async ({
      participants,
      participantIdsToDelete,
    }: {
      participants: InMemoryRecord[];
      participantIdsToDelete: string[];
    }) => {
      const participantTable = createInMemoryWorkspaceRepository(participants);

      const service = new CalendarEventParticipantService(
        {} as WorkspaceOrmManager,
        {} as MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
        {} as MessageQueueService,
      );

      await service.writeCalendarEventParticipants({
        operations: {
          participantIdsToDelete,
          participantsToUpdate: [],
          participantsToInsert: [],
        },
        transactionScope: {
          getRepository: jest.fn(() => participantTable.repository),
        } as unknown as WorkspaceTransactionScope,
      });

      return participantTable;
    };

    it('should delete removed participants in chunks of CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE', async () => {
      const removedParticipants = buildParticipants(
        2 * CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE + 50,
        'removed',
      );
      const keptParticipants = buildParticipants(5, 'kept');

      const participantTable = await writeParticipants({
        participants: [...keptParticipants, ...removedParticipants],
        participantIdsToDelete: removedParticipants.map(({ id }) => id),
      });

      expect(
        participantTable
          .getDeletedIdsByCall()
          .map((deletedIds) => deletedIds.length),
      ).toEqual([
        CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE,
        CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE,
        50,
      ]);
      expect(getIds(participantTable.getRecords())).toEqual(
        getIds(keptParticipants),
      );
    });

    it('should not delete anything when no participant was removed', async () => {
      const participants = buildParticipants(5, 'kept');

      const participantTable = await writeParticipants({
        participants,
        participantIdsToDelete: [],
      });

      expect(participantTable.repository.delete).not.toHaveBeenCalled();
      expect(getIds(participantTable.getRecords())).toEqual(
        getIds(participants),
      );
    });
  });
});
