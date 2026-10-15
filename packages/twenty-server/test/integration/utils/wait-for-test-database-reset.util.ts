import { existsSync, readFileSync } from 'fs';

import { isDefined } from 'twenty-shared/utils';

const POLL_INTERVAL_MS = 250;
const RESET_TIMEOUT_MS = 10 * 60 * 1000;
const RESET_SUCCEEDED_STATUS = 'ready';

export const waitForTestDatabaseReset = async (): Promise<void> => {
  const resetStatusFile = process.env.INTEGRATION_TEST_DB_RESET_STATUS_FILE;

  if (!isDefined(resetStatusFile)) {
    return;
  }

  const deadline = Date.now() + RESET_TIMEOUT_MS;

  while (!existsSync(resetStatusFile)) {
    if (Date.now() > deadline) {
      throw new Error(
        `Test database reset did not report a status within ${RESET_TIMEOUT_MS / 1000}s (${resetStatusFile})`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  const resetStatus = readFileSync(resetStatusFile, 'utf8').trim();

  if (resetStatus !== RESET_SUCCEEDED_STATUS) {
    throw new Error(
      `Test database reset did not succeed (status: ${resetStatus})`,
    );
  }
};
