import { existsSync, readFileSync } from 'fs';

import { isDefined } from 'twenty-shared/utils';

const POLL_INTERVAL_MS = 250;
const RESET_SUCCEEDED_STATUS = 'ready';

export const waitForTestDatabaseReset = async (): Promise<void> => {
  const resetStatusFile = process.env.INTEGRATION_TEST_DB_RESET_STATUS_FILE;

  if (!isDefined(resetStatusFile)) {
    return;
  }

  while (!existsSync(resetStatusFile)) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  const resetStatus = readFileSync(resetStatusFile, 'utf8').trim();

  if (resetStatus !== RESET_SUCCEEDED_STATUS) {
    throw new Error(
      `Test database reset did not succeed (status: ${resetStatus})`,
    );
  }
};
