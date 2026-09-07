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

afterAll(async () => {
  await closeQueueConnections();

  // Every suite shares one worker and V8 only collects lazily as the heap cap
  // rises, so without this the floor climbs all shard until a suite is refused.
  global.gc?.();
}, WAIT_FOR_JOBS_HOOK_TIMEOUT_MS);
