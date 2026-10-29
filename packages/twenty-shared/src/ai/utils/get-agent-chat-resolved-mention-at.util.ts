import { isAgentChatMentionUnresolved } from '@/ai/utils/is-agent-chat-mention-unresolved.util';

export const getAgentChatResolvedMentionAt = ({
  lastMentionedAt,
  lastResolvedMentionAt,
}: {
  lastMentionedAt?: string | null;
  lastResolvedMentionAt?: string | null;
}): string | null => {
  if (
    isAgentChatMentionUnresolved({ lastMentionedAt, lastResolvedMentionAt })
  ) {
    return lastMentionedAt ?? null;
  }

  return lastResolvedMentionAt ?? null;
};
