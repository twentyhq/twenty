import { isDefined } from '@/utils/validation/isDefined';

export const getAgentChatResolvedMentionAt = ({
  lastMentionedAt,
  lastResolvedMentionAt,
}: {
  lastMentionedAt?: string | null;
  lastResolvedMentionAt?: string | null;
}): string | null =>
  isDefined(lastMentionedAt) &&
  (!isDefined(lastResolvedMentionAt) ||
    new Date(lastMentionedAt) > new Date(lastResolvedMentionAt))
    ? lastMentionedAt
    : (lastResolvedMentionAt ?? null);
