export const getCancelChannel = (threadId: string) =>
  `ai-stream:cancel:${threadId}`;
