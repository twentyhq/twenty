import { isDefined } from '@/utils/validation/isDefined';

export const isAgentChatMentionUnresolved = ({
  lastMentionedAt,
  lastResolvedMentionAt,
}: {
  lastMentionedAt?: string | null;
  lastResolvedMentionAt?: string | null;
}): boolean =>
  isDefined(lastMentionedAt) &&
  (!isDefined(lastResolvedMentionAt) ||
    new Date(lastMentionedAt) > new Date(lastResolvedMentionAt));
