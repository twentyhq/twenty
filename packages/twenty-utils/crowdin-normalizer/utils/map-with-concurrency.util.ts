export async function mapWithConcurrency<TItem, TResult>({
  items,
  limit,
  handler,
}: {
  items: TItem[];
  limit: number;
  handler: (item: TItem) => Promise<TResult>;
}): Promise<TResult[]> {
  if (limit < 1) {
    throw new Error(
      `mapWithConcurrency needs a limit of at least 1, got ${limit}`,
    );
  }

  const results: TResult[] = Array.from({ length: items.length });
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;

      results[index] = await handler(items[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
}
