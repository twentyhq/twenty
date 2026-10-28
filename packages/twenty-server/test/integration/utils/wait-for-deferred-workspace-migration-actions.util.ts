import { isDefined } from 'twenty-shared/utils';

const POLL_INTERVAL_MS = 25;
const TIMEOUT_MS = 30_000;

type InFlightDeferredAction = {
  id: string;
  name: string;
  status: string;
  attempts: number;
  lastError: string | null;
};

// The next schema change is rejected while index builds or FK validations are queued.
export const waitForDeferredWorkspaceMigrationActions =
  async (): Promise<void> => {
    const deadline = Date.now() + TIMEOUT_MS;

    for (;;) {
      const inFlightActions: InFlightDeferredAction[] =
        await global.testDataSource.query(
          `SELECT id, name, status, attempts, "lastError"
           FROM core."deferredWorkspaceMigrationAction"
           WHERE status IN ('PENDING', 'IN_PROGRESS')`,
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

      if (Date.now() > deadline) {
        throw new Error(
          `${inFlightActions.length} deferred workspace migration action(s) still in flight after ${TIMEOUT_MS}ms: ${inFlightActions
            .map((action) => `${action.name} (${action.status})`)
            .join(', ')}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  };
