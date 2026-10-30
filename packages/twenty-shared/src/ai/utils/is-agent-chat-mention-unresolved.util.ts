import { isDefined } from '@/utils/validation/isDefined';

export const isAgentChatMentionUnresolved = ({
  lastMentionedAt,
  mentionsResolvedAt,
}: {
  lastMentionedAt?: string | null;
  mentionsResolvedAt?: string | null;
}): boolean =>
  isDefined(lastMentionedAt) &&
  (!isDefined(mentionsResolvedAt) ||
    new Date(lastMentionedAt) > new Date(mentionsResolvedAt));
