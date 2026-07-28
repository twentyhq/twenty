const DEFAULT_BATCH_SIZE = 5;

export const runInBatches = async <TItem>({
  items,
  batchSize = DEFAULT_BATCH_SIZE,
  handler,
  onError,
}: {
  items: TItem[];
  batchSize?: number;
  handler: (item: TItem) => Promise<void>;
  onError: (item: TItem, error: unknown) => void;
}): Promise<void> => {
  const sanitizedBatchSize = Math.max(1, Math.floor(batchSize));

  for (
    let batchStart = 0;
    batchStart < items.length;
    batchStart += sanitizedBatchSize
  ) {
    const batch = items.slice(batchStart, batchStart + sanitizedBatchSize);

    await Promise.all(
      batch.map(async (item) => {
        try {
          await handler(item);
        } catch (error) {
          onError(item, error);
        }
      }),
    );
  }
};
