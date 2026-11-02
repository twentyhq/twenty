import { isAgentChatMentionUnresolved } from '@/ai/utils/is-agent-chat-mention-unresolved.util';

export const getAgentChatMentionsResolvedAt = ({
  lastMentionedAt,
  mentionsResolvedAt,
}: {
  lastMentionedAt?: string | null;
  mentionsResolvedAt?: string | null;
}): string | null => {
  if (isAgentChatMentionUnresolved({ lastMentionedAt, mentionsResolvedAt })) {
    return lastMentionedAt ?? null;
  }

  return mentionsResolvedAt ?? null;
};
