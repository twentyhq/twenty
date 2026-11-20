import { isDefined } from '@/utils/validation/isDefined';

export const getAgentChatDirectMessagePeerWorkspaceMemberIds = ({
  thread,
  currentWorkspaceMemberId,
}: {
  thread: {
    directMessageFirstWorkspaceMemberId?: string | null;
    directMessageSecondWorkspaceMemberId?: string | null;
  };
  currentWorkspaceMemberId: string | undefined;
}): string[] =>
  [
    thread.directMessageFirstWorkspaceMemberId,
    thread.directMessageSecondWorkspaceMemberId,
  ].filter(
    (workspaceMemberId): workspaceMemberId is string =>
      isDefined(workspaceMemberId) &&
      workspaceMemberId !== currentWorkspaceMemberId,
  );
