// Runs `handler` over `items` with at most `limit` promises in flight, keeping
// the results in input order.
export async function mapWithConcurrency<TItem, TResult>({
  items,
  limit,
  handler,
}: {
  items: TItem[];
  limit: number;
  handler: (item: TItem) => Promise<TResult>;
}): Promise<TResult[]> {
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
