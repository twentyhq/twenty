import { isDefined } from 'twenty-shared/utils';

export const isAgentChatSnoozePending = ({
  archivedAt,
  snoozedUntil,
  scheduledSnoozedUntil,
}: {
  archivedAt: Date | string | null;
  snoozedUntil: Date | string | null;
  scheduledSnoozedUntil: string;
}): boolean =>
  isDefined(archivedAt) &&
  isDefined(snoozedUntil) &&
  new Date(snoozedUntil).getTime() ===
    new Date(scheduledSnoozedUntil).getTime();
