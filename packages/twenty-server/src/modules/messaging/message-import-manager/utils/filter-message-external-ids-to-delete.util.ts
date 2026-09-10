export const filterMessageExternalIdsToDelete = ({
  messageExternalIds,
  messageExternalIdsToDelete,
}: {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
}): string[] => {
  const presentMessageExternalIds = new Set(messageExternalIds);

  return [
    ...new Set(
      messageExternalIdsToDelete.filter(
        (messageExternalId) => !presentMessageExternalIds.has(messageExternalId),
      ),
    ),
  ];
};
