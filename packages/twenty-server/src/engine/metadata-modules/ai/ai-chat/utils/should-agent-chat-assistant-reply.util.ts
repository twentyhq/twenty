// In a chat between people, the assistant answers only when it is addressed
export const shouldAgentChatAssistantReply = ({
  isInboxEnabled,
  isAssistantMentioned,
  isAwaitingAssistantQuestion,
  memberCount,
}: {
  isInboxEnabled: boolean;
  isAssistantMentioned: boolean;
  isAwaitingAssistantQuestion: boolean;
  memberCount: number;
}): boolean =>
  !isInboxEnabled ||
  isAssistantMentioned ||
  isAwaitingAssistantQuestion ||
  memberCount < 2;
