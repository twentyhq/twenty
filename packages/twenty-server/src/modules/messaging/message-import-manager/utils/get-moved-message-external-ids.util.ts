export const getMovedMessageExternalIds = ({
  messageExternalIds,
  messageExternalIdsToDelete,
}: {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
}): Set<string> => {
  const removedMessageExternalIds = new Set(messageExternalIdsToDelete);

  return new Set(
    messageExternalIds.filter((messageExternalId) =>
      removedMessageExternalIds.has(messageExternalId),
    ),
  );
};
