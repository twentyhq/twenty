import { isDefined } from 'twenty-shared/utils';

const toOneMillisecondAfter = (value: Date | string | null | undefined) =>
  isDefined(value) ? new Date(value).getTime() + 1 : 0;

export const buildNextAgentChatLastMentionedAt = ({
  lastMentionedAt,
  mentionsResolvedAt,
}: {
  lastMentionedAt: Date | string | null | undefined;
  mentionsResolvedAt: Date | string | null | undefined;
}): string =>
  new Date(
    Math.max(
      Date.now(),
      toOneMillisecondAfter(lastMentionedAt),
      toOneMillisecondAfter(mentionsResolvedAt),
    ),
  ).toISOString();
