import { acquireRecordPermissionConnection } from 'src/engine/twenty-orm/datasource/utils/acquire-record-permission-connection.util';
import { type Pool, type PoolClient } from 'pg';
import { setTimeout as delay } from 'node:timers/promises';

import { runInRollbackSafeTransaction } from 'src/engine/twenty-orm/datasource/utils/run-in-rollback-safe-transaction.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const WORKSPACE_CONCURRENCY = 4;
const INSTANCE_CONCURRENCY = 32;
const ADMISSION_TIMEOUT_MILLISECONDS = 250;
const runningByWorkspace = new Map<string, number>();
let running = 0;

const capacityError = () =>
  new TwentyOrmException(
    'Record query capacity is temporarily exhausted',
    TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
  );

type PendingAdmission = {
  workspaceId: string;
  resolve: () => void;
  timer: ReturnType<typeof setTimeout>;
};
const pendingAdmissions: PendingAdmission[] = [];
const reserve = (workspaceId: string) => {
  runningByWorkspace.set(
    workspaceId,
    (runningByWorkspace.get(workspaceId) ?? 0) + 1,
  );
  running++;
};
const hasCapacity = (workspaceId: string) =>
  running < INSTANCE_CONCURRENCY &&
  (runningByWorkspace.get(workspaceId) ?? 0) < WORKSPACE_CONCURRENCY;
const admit = (workspaceId: string): Promise<void> => {
  if (hasCapacity(workspaceId)) {
    reserve(workspaceId);
    return Promise.resolve();
  }
  if (
    pendingAdmissions.length >= 256 ||
    pendingAdmissions.filter((entry) => entry.workspaceId === workspaceId)
      .length >= 32
  ) {
    return Promise.reject(capacityError());
  }
  return new Promise((resolve, reject) => {
    const entry: PendingAdmission = {
      workspaceId,
      resolve,
      timer: setTimeout(() => {
        const index = pendingAdmissions.indexOf(entry);
        if (index >= 0) pendingAdmissions.splice(index, 1);
        reject(capacityError());
      }, ADMISSION_TIMEOUT_MILLISECONDS),
    };
    pendingAdmissions.push(entry);
  });
};
const release = (workspaceId: string): void => {
  running--;
  const remaining = (runningByWorkspace.get(workspaceId) ?? 1) - 1;
  if (remaining === 0) runningByWorkspace.delete(workspaceId);
  else runningByWorkspace.set(workspaceId, remaining);
  // Skip saturated workspaces so their queued work cannot block another tenant.
  for (
    let index = 0;
    index < pendingAdmissions.length && running < INSTANCE_CONCURRENCY;
  ) {
    const entry = pendingAdmissions[index];
    if (!hasCapacity(entry.workspaceId)) {
      index++;
      continue;
    }
    pendingAdmissions.splice(index, 1);
    clearTimeout(entry.timer);
    reserve(entry.workspaceId);
    entry.resolve();
  }
};

export const runWithRecordPermissionBudget = async <TResult>({
  pool,
  workspaceId,
  work,
}: {
  pool: Pool;
  workspaceId: string;
  work: (client: PoolClient) => Promise<TResult>;
}): Promise<TResult> => {
  // A short bounded queue absorbs ordinary UI fan-out before acquiring database connections.
  const admissionDeadline = Date.now() + ADMISSION_TIMEOUT_MILLISECONDS;
  await admit(workspaceId);

  const databaseCapacityError = capacityError();

  try {
    while (true) {
      try {
        return await runInRollbackSafeTransaction({
          pool,
          acquireConnection: () => acquireRecordPermissionConnection(pool),
          work: async (client) => {
            await client.query("SET LOCAL statement_timeout = '250ms'");
            await client.query('SET LOCAL jit = off');
            await client.query("SET LOCAL lock_timeout = '50ms'");
            await client.query(
              "SET LOCAL idle_in_transaction_session_timeout = '5s'",
            );

            // Database slots also bound concurrency across API processes and replicas.
            for (const [key, slots] of [
              [`record-query:${workspaceId}`, WORKSPACE_CONCURRENCY],
              ['record-query:instance', INSTANCE_CONCURRENCY],
            ] as const) {
              const admission = await client.query(
                'SELECT slot FROM generate_series(0, $2::int - 1) AS slot WHERE pg_try_advisory_xact_lock(hashtextextended($1 || slot::text, 0)) LIMIT 1',
                [key, slots],
              );

              if (admission.rowCount === 0) throw databaseCapacityError;
            }

            return work(client);
          },
        });
      } catch (error) {
        if (
          error !== databaseCapacityError ||
          Date.now() >= admissionDeadline
        ) {
          throw error;
        }

        // Retry only admission, after rollback has released the connection and slots.
        await delay(Math.min(10, admissionDeadline - Date.now()));
      }
    }
  } finally {
    release(workspaceId);
  }
};
