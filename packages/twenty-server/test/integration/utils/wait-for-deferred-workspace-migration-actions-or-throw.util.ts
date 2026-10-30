import { setTimeout as sleep } from 'node:timers/promises';

import { isDefined } from 'twenty-shared/utils';

// Avoids global timers and Date: some suites enable jest fake timers in their setup.
const POLL_INTERVAL_MS = 25;
const MAX_ATTEMPTS = 1_200;

type InFlightDeferredAction = {
  id: string;
  name: string;
  status: string;
  attempts: number;
  lastError: string | null;
};

// The next schema change is rejected while index builds or FK validations are queued.
export const waitForDeferredWorkspaceMigrationActionsOrThrow =
  async (): Promise<void> => {
    for (let attempt = 1; ; attempt++) {
      const inFlightActions: InFlightDeferredAction[] =
        await global.testDataSource.query(
          `SELECT id, name, status, attempts, "lastError"
           FROM core."deferredWorkspaceMigrationAction"
           WHERE status IN ('PENDING', 'IN_PROGRESS')
           AND name IN ('build_index', 'validate_foreignKey')`,
        );

      if (inFlightActions.length === 0) {
        return;
      }

      const failedAction = inFlightActions.find((action) =>
        isDefined(action.lastError),
      );

      if (isDefined(failedAction)) {
        throw new Error(
          `Deferred action ${failedAction.name} ${failedAction.id} failed after ${failedAction.attempts} attempt(s): ${failedAction.lastError}`,
        );
      }

      if (attempt >= MAX_ATTEMPTS) {
        throw new Error(
          `${inFlightActions.length} deferred workspace migration action(s) still in flight after ${MAX_ATTEMPTS * POLL_INTERVAL_MS}ms: ${inFlightActions
            .map((action) => `${action.name} (${action.status})`)
            .join(', ')}`,
        );
      }

      await sleep(POLL_INTERVAL_MS);
    }
  };
