import * as Sentry from '@sentry/node';

import { AI_CHAT_STREAM_FUNCTION_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-stream-function-id.constant';
import { AI_CHAT_WORKSPACE_SETUP_STREAM_FUNCTION_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-workspace-setup-stream-function-id.constant';

export const tagAiChatKindScope = ({
  isWorkspaceSetupThread,
}: {
  isWorkspaceSetupThread: boolean;
}) => {
  Sentry.getCurrentScope().setTag(
    'chatKind',
    isWorkspaceSetupThread
      ? AI_CHAT_WORKSPACE_SETUP_STREAM_FUNCTION_ID
      : AI_CHAT_STREAM_FUNCTION_ID,
  );
};
