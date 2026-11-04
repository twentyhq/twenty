import { isDefined } from 'twenty-shared/utils';

export const buildNextAgentChatThreadParticipantUpdatedAt = (
  previousUpdatedAt: Date | string | null | undefined,
): string =>
  new Date(
    Math.max(
      Date.now(),
      isDefined(previousUpdatedAt)
        ? new Date(previousUpdatedAt).getTime() + 1
        : 0,
    ),
  ).toISOString();
