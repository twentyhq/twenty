import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { RECORD_DELETE_BATCH_SIZE } from 'src/engine/twenty-orm/constants/record-delete-batch-size.constant';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { type MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { type DeleteWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run/command/delete-workflow-runs.command';

const SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type DestroyEvent = {
  recordId: string;
  properties: { before: Record<string, unknown> };
};

type DestroyEventBatch = {
  events: DestroyEvent[];
  storedRecordCountAtEmission: number;
  remainingRecordCountAtEmission: number;
};

const countRows = async (
  tableName: string,
  whereClause: string,
  parameters: unknown[],
): Promise<number> => {
  const [{ count }] = await global.testDataSource.query(
    `SELECT COUNT(*) AS count FROM "${SCHEMA_NAME}"."${tableName}" WHERE ${whereClause}`,
    parameters,
  );

  return Number(count);
};

const selectIds = async (
  tableName: string,
  whereClause: string,
  parameters: unknown[],
): Promise<string[]> => {
  const rows: { id: string }[] = await global.testDataSource.query(
    `SELECT id FROM "${SCHEMA_NAME}"."${tableName}" WHERE ${whereClause}`,
    parameters,
  );

  return rows.map(({ id }) => id);
};

// Events are swallowed so the test does not flood the queues, and each batch
// is checked from another connection when it is emitted
const recordDestroyEventBatches = ({
  objectMetadataNameSingular,
  countRemainingRecords,
}: {
  objectMetadataNameSingular: string;
  countRemainingRecords: () => Promise<number>;
}): DestroyEventBatch[] => {
  const destroyEventBatches: DestroyEventBatch[] = [];

  jest
    .spyOn(
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
      'emitDatabaseBatchEvent',
    )
    // The after-commit hook awaits the emitter, so each check completes before
    // the next batch starts
    // oxlint-disable-next-line typescript/no-misused-promises
    .mockImplementation(async (databaseBatchEvent) => {
      if (
        databaseBatchEvent?.objectMetadataNameSingular !==
          objectMetadataNameSingular ||
        databaseBatchEvent.action !== DatabaseEventAction.DESTROYED
      ) {
        return;
      }

      const events = databaseBatchEvent.events as unknown as DestroyEvent[];

      destroyEventBatches.push({
        events,
        storedRecordCountAtEmission: await countRows(
          objectMetadataNameSingular,
          'id = ANY($1)',
          [events.map(({ recordId }) => recordId)],
        ),
        remainingRecordCountAtEmission: await countRemainingRecords(),
      });
    });

  return destroyEventBatches;
};

// Other suites may leave matching rows behind, so only the test's own rows
// are compared
const getDestroyedIdsAmong = (
  destroyEventBatches: DestroyEventBatch[],
  recordIds: string[],
) => {
  const recordIdSet = new Set(recordIds);

  return destroyEventBatches
    .flatMap(({ events }) => events.map(({ recordId }) => recordId))
    .filter((recordId) => recordIdSet.has(recordId));
};

// Fails the given transaction once its work is done, so whatever it deleted
// is rolled back
const failTransactionAfterItsWork = (failingTransactionNumber: number) => {
  const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
    'WorkspaceOrmManager',
  );
  const runInWorkspaceTransaction =
    workspaceOrmManager.runInWorkspaceTransaction.bind(workspaceOrmManager);
  const transactionFailure = new Error('Simulated failure before commit');
  let transactionCount = 0;

  const transactionSpy = jest
    .spyOn(workspaceOrmManager, 'runInWorkspaceTransaction')
    .mockImplementation(
      <T>(
        work: (transactionScope: WorkspaceTransactionScope) => Promise<T>,
      ) => {
        transactionCount += 1;

        const isFailingTransaction =
          transactionCount === failingTransactionNumber;

        return runInWorkspaceTransaction(
          async (transactionScope: WorkspaceTransactionScope) => {
            const result = await work(transactionScope);

            if (isFailingTransaction) {
              throw transactionFailure;
            }

            return result;
          },
        );
      },
    );

  return { transactionSpy };
};

describe('batched internal deletes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('DeleteWorkflowRunsCommand', () => {
    const OLD_RUN_COUNT = 2 * RECORD_DELETE_BATCH_SIZE + 500;
    const OLD_TRASHED_RUN_COUNT = 3;
    let runName: string;

    const insertWorkflowRuns = ({
      count,
      createdAt,
      deletedAt = null,
    }: {
      count: number;
      createdAt: string;
      deletedAt?: string | null;
    }) =>
      global.testDataSource.query(
        `INSERT INTO "${SCHEMA_NAME}"."workflowRun" (id, name, state, "createdAt", "deletedAt")
         SELECT gen_random_uuid(), $1, '{}'::jsonb, $2, $3 FROM generate_series(1, $4)`,
        [runName, createdAt, deletedAt, count],
      );

    const countOldRuns = () =>
      countRows('workflowRun', `name = $1 AND "createdAt" < '2000-01-01'`, [
        runName,
      ]);

    const deleteRunsCreatedBefore2000 = async () => {
      const command = getAppProviderByClassName<DeleteWorkflowRunsCommand>(
        'DeleteWorkflowRunsCommand',
      );
      const loggerErrorSpy = jest
        .spyOn(command['logger'], 'error')
        .mockImplementation();

      jest.spyOn(command['logger'], 'log').mockImplementation();
      command.parseCreatedBefore('2000-01-01');

      await command.runOnWorkspace({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        options: {},
        index: 0,
        total: 1,
      });

      return { loggerErrorSpy };
    };

    beforeEach(async () => {
      runName = `Batched delete test run ${randomUUID()}`;

      await insertWorkflowRuns({
        count: OLD_RUN_COUNT,
        createdAt: '1999-06-01T00:00:00.000Z',
      });
      await insertWorkflowRuns({
        count: OLD_TRASHED_RUN_COUNT,
        createdAt: '1999-06-01T00:00:00.000Z',
        deletedAt: '1999-07-01T00:00:00.000Z',
      });
      await insertWorkflowRuns({
        count: 5,
        createdAt: '2000-06-01T00:00:00.000Z',
      });
    });

    afterEach(async () => {
      await global.testDataSource.query(
        `DELETE FROM "${SCHEMA_NAME}"."workflowRun" WHERE name = $1`,
        [runName],
      );
    });

    it(`should delete more than ${RECORD_DELETE_BATCH_SIZE} runs in batches that each commit before their events are emitted`, async () => {
      const oldRunIds = await selectIds(
        'workflowRun',
        `name = $1 AND "createdAt" < '2000-01-01'`,
        [runName],
      );
      const destroyEventBatches = recordDestroyEventBatches({
        objectMetadataNameSingular: 'workflowRun',
        countRemainingRecords: countOldRuns,
      });

      await deleteRunsCreatedBefore2000();

      expect(destroyEventBatches.map(({ events }) => events.length)).toEqual([
        RECORD_DELETE_BATCH_SIZE,
        RECORD_DELETE_BATCH_SIZE,
        500 + OLD_TRASHED_RUN_COUNT,
      ]);
      expect(
        destroyEventBatches.map(
          ({ storedRecordCountAtEmission, remainingRecordCountAtEmission }) => [
            storedRecordCountAtEmission,
            remainingRecordCountAtEmission,
          ],
        ),
      ).toEqual([
        [0, OLD_RUN_COUNT + OLD_TRASHED_RUN_COUNT - RECORD_DELETE_BATCH_SIZE],
        [0, 500 + OLD_TRASHED_RUN_COUNT],
        [0, 0],
      ]);
      expect(
        getDestroyedIdsAmong(destroyEventBatches, oldRunIds).sort(),
      ).toEqual([...oldRunIds].sort());
      expect(
        destroyEventBatches
          .flatMap(({ events }) => events)
          .every(
            ({ recordId, properties }) =>
              properties.before.id === recordId &&
              properties.before.name === runName,
          ),
      ).toBe(true);
      expect(await countRows('workflowRun', 'name = $1', [runName])).toBe(5);
    });

    it('should keep the batches committed before a failing batch, emit nothing for it, and finish on retry', async () => {
      const oldRunIds = await selectIds(
        'workflowRun',
        `name = $1 AND "createdAt" < '2000-01-01'`,
        [runName],
      );
      const destroyEventBatches = recordDestroyEventBatches({
        objectMetadataNameSingular: 'workflowRun',
        countRemainingRecords: countOldRuns,
      });
      const { transactionSpy } = failTransactionAfterItsWork(2);

      const { loggerErrorSpy } = await deleteRunsCreatedBefore2000();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error while deleting workflowRun',
        expect.anything(),
      );
      expect(destroyEventBatches.map(({ events }) => events.length)).toEqual([
        RECORD_DELETE_BATCH_SIZE,
      ]);
      expect(await countOldRuns()).toBe(
        OLD_RUN_COUNT + OLD_TRASHED_RUN_COUNT - RECORD_DELETE_BATCH_SIZE,
      );

      transactionSpy.mockRestore();

      await deleteRunsCreatedBefore2000();

      expect(destroyEventBatches.map(({ events }) => events.length)).toEqual([
        RECORD_DELETE_BATCH_SIZE,
        RECORD_DELETE_BATCH_SIZE,
        500 + OLD_TRASHED_RUN_COUNT,
      ]);
      expect(
        getDestroyedIdsAmong(destroyEventBatches, oldRunIds).sort(),
      ).toEqual([...oldRunIds].sort());
      expect(await countOldRuns()).toBe(0);
    });
  });

  describe('MessagingMessageCleanerService.cleanOrphanMessagesAndThreads', () => {
    const ORPHAN_MESSAGE_COUNT = RECORD_DELETE_BATCH_SIZE + 200;
    let subject: string;

    const countOrphanMessages = () =>
      countRows('message', 'subject = $1', [subject]);

    beforeEach(async () => {
      subject = `Batched delete test message ${randomUUID()}`;

      await global.testDataSource.query(
        `INSERT INTO "${SCHEMA_NAME}"."message" (id, subject)
         SELECT gen_random_uuid(), $1 FROM generate_series(1, $2)`,
        [subject, ORPHAN_MESSAGE_COUNT],
      );
    });

    afterEach(async () => {
      await global.testDataSource.query(
        `DELETE FROM "${SCHEMA_NAME}"."message" WHERE subject = $1`,
        [subject],
      );
    });

    it('should commit each page on its own, emit nothing for a page that fails, and finish on retry', async () => {
      const orphanMessageIds = await selectIds('message', 'subject = $1', [
        subject,
      ]);
      const destroyEventBatches = recordDestroyEventBatches({
        objectMetadataNameSingular: 'message',
        countRemainingRecords: countOrphanMessages,
      });
      const reconcileMessageThreadTargetsSpy = jest
        .spyOn(
          getAppProviderByClassName<ParticipantTargetReconciliationService>(
            'ParticipantTargetReconciliationService',
          ),
          'reconcileMessageThreadTargets',
        )
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Simulated failure before commit'));
      const messagingMessageCleanerService =
        getAppProviderByClassName<MessagingMessageCleanerService>(
          'MessagingMessageCleanerService',
        );

      await expect(
        messagingMessageCleanerService.cleanOrphanMessagesAndThreads(
          SEED_APPLE_WORKSPACE_ID,
        ),
      ).rejects.toThrow();

      expect(destroyEventBatches).toHaveLength(1);

      const [firstPage] = destroyEventBatches;

      expect(firstPage.storedRecordCountAtEmission).toBe(0);
      expect(await countOrphanMessages()).toBe(
        ORPHAN_MESSAGE_COUNT -
          getDestroyedIdsAmong([firstPage], orphanMessageIds).length,
      );

      reconcileMessageThreadTargetsSpy.mockRestore();

      await messagingMessageCleanerService.cleanOrphanMessagesAndThreads(
        SEED_APPLE_WORKSPACE_ID,
      );

      expect(
        destroyEventBatches.every(
          ({ events, storedRecordCountAtEmission }) =>
            events.length <= RECORD_DELETE_BATCH_SIZE &&
            storedRecordCountAtEmission === 0,
        ),
      ).toBe(true);
      expect(
        getDestroyedIdsAmong(destroyEventBatches, orphanMessageIds).sort(),
      ).toEqual([...orphanMessageIds].sort());
      expect(await countOrphanMessages()).toBe(0);
    });
  });
});
