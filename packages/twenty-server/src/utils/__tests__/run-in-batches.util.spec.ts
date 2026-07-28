import { runInBatches } from 'src/utils/run-in-batches.util';

describe('runInBatches', () => {
  it('should process every item', async () => {
    const processedItems: number[] = [];

    await runInBatches({
      items: [1, 2, 3, 4, 5],
      batchSize: 2,
      handler: async (item) => {
        processedItems.push(item);
      },
      onError: () => {},
    });

    expect(processedItems.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should not start a batch before the previous one is done', async () => {
    const events: string[] = [];

    let resolveFirstBatch: () => void = () => {};

    const firstBatchGate = new Promise<void>((resolve) => {
      resolveFirstBatch = resolve;
    });

    const run = runInBatches({
      items: ['a', 'b', 'c'],
      batchSize: 2,
      handler: async (item) => {
        events.push(`start:${item}`);

        if (item === 'a') {
          await firstBatchGate;
        }

        events.push(`end:${item}`);
      },
      onError: () => {},
    });

    await Promise.resolve();

    expect(events).toEqual(['start:a', 'start:b', 'end:b']);

    resolveFirstBatch();

    await run;

    expect(events).toEqual([
      'start:a',
      'start:b',
      'end:b',
      'end:a',
      'start:c',
      'end:c',
    ]);
  });

  it('should report failures without interrupting the other items', async () => {
    const failures: { item: string; message: string }[] = [];
    const processedItems: string[] = [];

    await runInBatches({
      items: ['ok', 'ko', 'ok-again'],
      batchSize: 2,
      handler: async (item) => {
        if (item === 'ko') {
          throw new Error('boom');
        }

        processedItems.push(item);
      },
      onError: (item, error) => {
        failures.push({
          item,
          message: error instanceof Error ? error.message : String(error),
        });
      },
    });

    expect(processedItems).toEqual(['ok', 'ok-again']);
    expect(failures).toEqual([{ item: 'ko', message: 'boom' }]);
  });

  it('should fall back to a batch size of one when given an invalid batch size', async () => {
    const processedItems: number[] = [];

    await runInBatches({
      items: [1, 2],
      batchSize: 0,
      handler: async (item) => {
        processedItems.push(item);
      },
      onError: () => {},
    });

    expect(processedItems).toEqual([1, 2]);
  });
});
