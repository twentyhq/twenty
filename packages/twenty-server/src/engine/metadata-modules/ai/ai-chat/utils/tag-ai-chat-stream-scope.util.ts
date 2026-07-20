import * as Sentry from '@sentry/node';

export const tagAiChatStreamScope = ({
  streamId,
  turnId,
  threadId,
  workspaceId,
}: {
  streamId: string;
  turnId?: string | null;
  threadId: string;
  workspaceId: string;
}) => {
  Sentry.getCurrentScope().setTags({
    streamId,
    turnId: turnId ?? undefined,
    threadId,
    workspaceId,
  });
};
