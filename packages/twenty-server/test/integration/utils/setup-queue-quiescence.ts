import {
  closeQueueQuiescenceResources,
  waitForQueueQuiescence,
} from 'test/integration/utils/wait-for-queue-quiescence.util';

const QUIESCENCE_HOOK_TIMEOUT_MS = 150_000;

beforeAll(async () => {
  await waitForQueueQuiescence();
}, QUIESCENCE_HOOK_TIMEOUT_MS);

afterEach(async () => {
  jest.useRealTimers();
  await waitForQueueQuiescence();
}, QUIESCENCE_HOOK_TIMEOUT_MS);

afterAll(async () => {
  await closeQueueQuiescenceResources();
});
