import { isDefined } from 'twenty-shared/utils';

const toOneMillisecondAfter = (value: Date | string | null | undefined) =>
  isDefined(value) ? new Date(value).getTime() + 1 : 0;

export const buildNextAgentChatThreadActivityAt = ({
  lastActivityAt,
  updatedAt,
}: {
  lastActivityAt: Date | string | null | undefined;
  updatedAt: Date | string | null | undefined;
}): Date =>
  new Date(
    Math.max(
      Date.now(),
      toOneMillisecondAfter(lastActivityAt),
      toOneMillisecondAfter(updatedAt),
    ),
  );
