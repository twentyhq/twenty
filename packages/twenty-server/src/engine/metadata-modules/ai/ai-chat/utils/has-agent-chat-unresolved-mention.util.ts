import { isDefined } from 'twenty-shared/utils';

export const hasAgentChatUnresolvedMention = ({
  lastMentionedAt,
  mentionsResolvedAt,
}: {
  lastMentionedAt: Date | string | null;
  mentionsResolvedAt: Date | string | null;
}): boolean =>
  isDefined(lastMentionedAt) &&
  (!isDefined(mentionsResolvedAt) ||
    new Date(lastMentionedAt).getTime() >
      new Date(mentionsResolvedAt).getTime());
