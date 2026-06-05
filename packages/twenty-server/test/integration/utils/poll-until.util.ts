import { setTimeout as sleep } from 'node:timers/promises';

export const pollUntil = async <TValue>(
  read: () => Promise<TValue>,
  predicate: (value: TValue) => boolean,
  {
    timeoutMs = 30_000,
    intervalMs = 250,
  }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<TValue> => {
  const startedAt = Date.now();

  let value = await read();

  while (!predicate(value) && Date.now() - startedAt < timeoutMs) {
    await sleep(intervalMs);
    value = await read();
  }

  return value;
};
