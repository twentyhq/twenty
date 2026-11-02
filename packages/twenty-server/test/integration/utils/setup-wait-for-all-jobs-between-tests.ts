import {
  closeQueueConnections,
  waitForAllJobsToFinish,
} from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const WAIT_FOR_JOBS_HOOK_TIMEOUT_MS = 150_000;

beforeAll(async () => {
  await waitForAllJobsToFinish();
}, WAIT_FOR_JOBS_HOOK_TIMEOUT_MS);

afterEach(async () => {
  jest.useRealTimers();
  await waitForAllJobsToFinish();
}, WAIT_FOR_JOBS_HOOK_TIMEOUT_MS);

// runs after each file's own afterAll, so jobs its cleanup started finish before the app shuts down
afterAll(async () => {
  try {
    await waitForAllJobsToFinish();
  } finally {
    await closeQueueConnections();
  }
}, WAIT_FOR_JOBS_HOOK_TIMEOUT_MS);
