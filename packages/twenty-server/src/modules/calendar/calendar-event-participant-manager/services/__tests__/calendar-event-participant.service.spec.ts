import {
  createInMemoryWorkspaceRepository,
  type InMemoryRecord,
} from 'test/utils/create-in-memory-workspace-repository.util';

import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECORD_DELETE_BATCH_SIZE } from 'src/engine/twenty-orm/constants/record-delete-batch-size.constant';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
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
  describe('deleteCalendarEventParticipants', () => {
    const deleteParticipants = async ({
      participants,
      participantIdsToDelete,
    }: {
      participants: InMemoryRecord[];
      participantIdsToDelete: string[];
    }) => {
      const participantTable = createInMemoryWorkspaceRepository(participants);
      const runInWorkspaceTransaction = jest.fn(
        (work: (transactionScope: WorkspaceTransactionScope) => unknown) =>
          work({
            getRepository: jest.fn(() => participantTable.repository),
          } as unknown as WorkspaceTransactionScope),
      );

      const service = new CalendarEventParticipantService(
        { runInWorkspaceTransaction } as unknown as WorkspaceOrmManager,
        {} as MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
        {} as MessageQueueService,
      );

      await service.deleteCalendarEventParticipants(participantIdsToDelete);

      return { participantTable, runInWorkspaceTransaction };
    };

    it('should delete removed participants in batches of at most RECORD_DELETE_BATCH_SIZE, one transaction per batch', async () => {
      const removedParticipants = buildParticipants(
        2 * RECORD_DELETE_BATCH_SIZE + 50,
        'removed',
      );
      const keptParticipants = buildParticipants(5, 'kept');

      const { participantTable, runInWorkspaceTransaction } =
        await deleteParticipants({
          participants: [...keptParticipants, ...removedParticipants],
          participantIdsToDelete: removedParticipants.map(({ id }) => id),
        });

      expect(
        participantTable
          .getDeletedIdsByCall()
          .map((deletedIds) => deletedIds.length),
      ).toEqual([RECORD_DELETE_BATCH_SIZE, RECORD_DELETE_BATCH_SIZE, 50]);
      expect(runInWorkspaceTransaction).toHaveBeenCalledTimes(3);
      expect(getIds(participantTable.getRecords())).toEqual(
        getIds(keptParticipants),
      );
    });

    it('should not open a transaction when no participant was removed', async () => {
      const participants = buildParticipants(5, 'kept');

      const { participantTable, runInWorkspaceTransaction } =
        await deleteParticipants({
          participants,
          participantIdsToDelete: [],
        });

      expect(runInWorkspaceTransaction).not.toHaveBeenCalled();
      expect(participantTable.repository.delete).not.toHaveBeenCalled();
      expect(getIds(participantTable.getRecords())).toEqual(
        getIds(participants),
      );
    });
  });
});
