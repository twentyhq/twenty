import { MESSAGE_QUEUE_WORKER_CONFIG } from 'src/engine/core-modules/message-queue/message-queue-worker-config.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { createQueueOrderSignal } from 'test/integration/message-queue/utils/create-queue-order-signal.util';
import { withQueueOrderTestContext } from 'test/integration/message-queue/utils/with-queue-order-test-context.util';

const queue1 = MessageQueue.workflowQueue;
const queue2 = MessageQueue.delayedJobsQueue;

describe('BullMQDriver queue ordering (integration)', () => {
  it('preserves FIFO within a queue while another queue progresses independently', async () => {
    const jobs = [
      { queue: queue1, name: 'job-queue1-1', priority: 1 },
      { queue: queue2, name: 'job-queue2-1', priority: 0 },
      { queue: queue1, name: 'job-queue1-2', priority: 1 },
      { queue: queue1, name: 'job-queue1-3', priority: 1 },
    ];
    const expectedOrder = [
      'job-queue1-1',
      'job-queue2-1',
      'job-queue1-2',
      'job-queue1-3',
    ];
    const actualOrder: string[] = [];
    const firstStarted = createQueueOrderSignal();
    const releaseFirst = createQueueOrderSignal();
    const queue2Started = createQueueOrderSignal();
    const queue1Done = createQueueOrderSignal();

    await withQueueOrderTestContext(async (driver) => {
      for (const job of jobs) {
        await driver.add(job.queue, job.name, {}, { priority: job.priority });
      }

      try {
        driver.work(
          queue1,
          async (job) => {
            actualOrder.push(job.name);
            if (job.name === 'job-queue1-1') {
              firstStarted.resolve();
              await releaseFirst.promise;
            }
            if (job.name === 'job-queue1-3') {
              queue1Done.resolve();
            }
          },
          MESSAGE_QUEUE_WORKER_CONFIG[queue1].workerOptions,
        );

        await firstStarted.promise;
        driver.work(
          queue2,
          async (job) => {
            actualOrder.push(job.name);
            queue2Started.resolve();
          },
          MESSAGE_QUEUE_WORKER_CONFIG[queue2].workerOptions,
        );

        await queue2Started.promise;
        expect(actualOrder).toEqual(expectedOrder.slice(0, 2));
        releaseFirst.resolve();
        await queue1Done.promise;
        expect(actualOrder).toEqual(expectedOrder);
      } finally {
        releaseFirst.resolve();
      }
    });
  });

  it('orders jobs by priority within one queue and uses FIFO for equal default priorities', async () => {
    const jobs = [
      { name: 'application-job', priority: 10 },
      { name: 'ordinary-job-1', priority: undefined },
      { name: 'urgent-job', priority: 1 },
      { name: 'ordinary-job-2', priority: undefined },
      { name: 'zero-priority-job', priority: 0 },
    ];
    const expectedOrder = [
      'zero-priority-job',
      'urgent-job',
      'ordinary-job-1',
      'ordinary-job-2',
      'application-job',
    ];
    const actualOrder: string[] = [];
    const done = createQueueOrderSignal();

    await withQueueOrderTestContext(async (driver) => {
      for (const job of jobs) {
        await driver.add(queue1, job.name, {}, { priority: job.priority });
      }
      driver.work(
        queue1,
        async (job) => {
          actualOrder.push(job.name);
          if (actualOrder.length === jobs.length) {
            done.resolve();
          }
        },
        MESSAGE_QUEUE_WORKER_CONFIG[queue1].workerOptions,
      );

      await done.promise;
      expect(actualOrder).toEqual(expectedOrder);
    });
  });
});
