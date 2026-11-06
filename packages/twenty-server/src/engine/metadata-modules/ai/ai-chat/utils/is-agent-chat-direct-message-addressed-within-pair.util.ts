import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const isAgentChatDirectMessageAddressedWithinPair = ({
  thread,
  senderWorkspaceMemberId,
  addressedWorkspaceMemberIds,
}: {
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    | 'directMessageFirstWorkspaceMemberId'
    | 'directMessageSecondWorkspaceMemberId'
  >;
  senderWorkspaceMemberId: string;
  addressedWorkspaceMemberIds: string[];
}): boolean => {
  const pairWorkspaceMemberIds = [
    thread.directMessageFirstWorkspaceMemberId,
    thread.directMessageSecondWorkspaceMemberId,
  ];

  return (
    pairWorkspaceMemberIds.includes(senderWorkspaceMemberId) &&
    addressedWorkspaceMemberIds.every((workspaceMemberId) =>
      pairWorkspaceMemberIds.includes(workspaceMemberId.toLowerCase()),
    )
  );
};
