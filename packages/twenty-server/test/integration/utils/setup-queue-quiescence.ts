import {
  closeQueueQuiescenceResources,
  waitForQueueQuiescence,
} from 'test/integration/utils/wait-for-queue-quiescence.util';

beforeAll(async () => {
  await waitForQueueQuiescence();
});

afterEach(async () => {
  jest.useRealTimers();
  await waitForQueueQuiescence();
});

afterAll(async () => {
  await closeQueueQuiescenceResources();
});
