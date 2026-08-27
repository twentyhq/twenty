import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

// The queue drain polls with real setTimeout; under jest fake timers (the
// integration-suite default) the polling would never advance and the test
// would hang until its timeout.
export const drainApplicationJobs = async (): Promise<void> => {
  const setTimeoutIsFaked =
    jest.isMockFunction(globalThis.setTimeout) ||
    'clock' in (globalThis.setTimeout as object);

  if (!setTimeoutIsFaked) {
    await waitForAllJobsToFinish();

    return;
  }

  jest.useRealTimers();

  try {
    await waitForAllJobsToFinish();
  } finally {
    jest.useFakeTimers();
  }
};
