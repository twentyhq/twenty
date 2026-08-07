import { v5 } from 'uuid';

export const WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE =
  '1e9195f3-c26a-4bfc-961e-dc317b4badbd';

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
