export const getAiChatToolErrorFingerprint = ({
  error,
  toolName,
}: {
  error: unknown;
  toolName: string;
}): string[] => [
  'ai-chat-tool-error',
  toolName,
  error instanceof Error ? error.name : typeof error,
];
