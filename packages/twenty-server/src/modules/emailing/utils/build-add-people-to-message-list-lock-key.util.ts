export const buildAddPeopleToMessageListLockKey = ({
  workspaceId,
  messageListId,
}: {
  workspaceId: string;
  messageListId: string;
}): string => `add-people-to-message-list:${workspaceId}:${messageListId}`;
