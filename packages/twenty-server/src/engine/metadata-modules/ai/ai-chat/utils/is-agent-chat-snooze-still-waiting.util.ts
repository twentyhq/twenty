import { isDefined } from 'twenty-shared/utils';

type AgentChatSnoozeWaitArgs = {
  archivedAt: string | Date | null;
  snoozedUntil: string | Date | null;
  jobSnoozedUntil: string;
};

export const isAgentChatSnoozeStillWaiting = ({
  archivedAt,
  snoozedUntil,
  jobSnoozedUntil,
}: AgentChatSnoozeWaitArgs): boolean =>
  isDefined(archivedAt) &&
  isDefined(snoozedUntil) &&
  new Date(snoozedUntil).getTime() === new Date(jobSnoozedUntil).getTime();
