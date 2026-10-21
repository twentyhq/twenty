import { type EntityManager } from 'typeorm';

// Read on the database's clock, which stamped the snooze
export const findAgentChatSnoozeRemainingDelay = async ({
  manager,
  snoozedUntil,
}: {
  manager: Pick<EntityManager, 'query'>;
  snoozedUntil: string;
}): Promise<number> => {
  const [{ remainingDelay }] = await manager.query<
    { remainingDelay: number }[]
  >(
    `SELECT GREATEST(CEIL(EXTRACT(EPOCH FROM $1::timestamptz - clock_timestamp()) * 1000), 0)::int AS "remainingDelay"`,
    [snoozedUntil],
  );

  return remainingDelay;
};
