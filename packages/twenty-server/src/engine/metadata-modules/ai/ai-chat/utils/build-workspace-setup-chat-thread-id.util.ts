import { v5 } from 'uuid';

import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';

export const buildWorkspaceSetupChatThreadId = ({
  workspaceId,
  userWorkspaceId,
}: {
  workspaceId: string;
  userWorkspaceId: string;
}): string =>
  v5(
    `${workspaceId}:${userWorkspaceId}`,
    WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE,
  );
