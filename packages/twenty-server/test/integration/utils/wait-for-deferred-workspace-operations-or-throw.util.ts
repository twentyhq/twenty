import { setTimeout as sleep } from 'node:timers/promises';

import { isDefined } from 'twenty-shared/utils';

// Avoids global timers and Date: some suites enable jest fake timers in their setup.
const POLL_INTERVAL_MS = 25;
const MAX_ATTEMPTS = 1_200;

type InFlightDeferredOperation = {
  id: string;
  name: string;
  status: string;
  attempts: number;
  lastError: string | null;
};

// The next schema change is rejected while index builds or FK validations are queued.
export const waitForDeferredWorkspaceOperationsOrThrow =
  async (): Promise<void> => {
    for (let attempt = 1; ; attempt++) {
      const inFlightOperations: InFlightDeferredOperation[] =
        await global.testDataSource.query(
          `SELECT id, name, status, attempts, "lastError"
           FROM core."deferredWorkspaceOperation"
           WHERE status IN ('PENDING', 'IN_PROGRESS')
           AND name IN ('build_index', 'validate_foreignKey')`,
        );

      if (inFlightOperations.length === 0) {
        return;
      }

      const failedOperation = inFlightOperations.find((operation) =>
        isDefined(operation.lastError),
      );

      if (isDefined(failedOperation)) {
        throw new Error(
          `Deferred operation ${failedOperation.name} ${failedOperation.id} failed after ${failedOperation.attempts} attempt(s): ${failedOperation.lastError}`,
        );
      }

      if (attempt >= MAX_ATTEMPTS) {
        throw new Error(
          `${inFlightOperations.length} deferred workspace operation(s) still in flight after ${MAX_ATTEMPTS * POLL_INTERVAL_MS}ms: ${inFlightOperations
            .map((operation) => `${operation.name} (${operation.status})`)
            .join(', ')}`,
        );
      }

      await sleep(POLL_INTERVAL_MS);
    }
  };
