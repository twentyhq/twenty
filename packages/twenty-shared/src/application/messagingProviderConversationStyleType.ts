export const MESSAGING_PROVIDER_CONVERSATION_STYLES = [
  'chat',
  'email',
] as const;

export type MessagingProviderConversationStyle =
  (typeof MESSAGING_PROVIDER_CONVERSATION_STYLES)[number];
