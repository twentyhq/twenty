export const getCancelChannel = (threadId: string, streamId: string) =>
  `ai-stream:cancel:${threadId}:${streamId}`;
