export const buildAddPeopleToMessageListJobId = ({
  workspaceId,
  messageListId,
}: {
  workspaceId: string;
  messageListId: string;
}): string => `add-people-to-message-list.${workspaceId}.${messageListId}`;
