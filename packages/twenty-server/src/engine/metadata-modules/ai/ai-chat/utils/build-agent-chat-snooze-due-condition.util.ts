import { Raw } from 'typeorm';

export const buildAgentChatSnoozeDueCondition = (snoozedUntil: string) =>
  Raw(
    (column) =>
      `${column} = :snoozedUntil::timestamptz AND ${column} <= clock_timestamp()`,
    { snoozedUntil },
  );
