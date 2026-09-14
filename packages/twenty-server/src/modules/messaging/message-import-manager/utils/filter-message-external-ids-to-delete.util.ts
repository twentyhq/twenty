import { isNonEmptyString } from '@sniptt/guards';

export const filterMessageExternalIdsToDelete = ({
  messageExternalIds,
  messageExternalIdsToDelete,
}: {
  messageExternalIds: string[];
  messageExternalIdsToDelete: (string | null)[];
}): string[] => {
  const presentMessageExternalIds = new Set(messageExternalIds);

  return [
    ...new Set(
      messageExternalIdsToDelete
        .filter(isNonEmptyString)
        .filter(
          (messageExternalId) =>
            !presentMessageExternalIds.has(messageExternalId),
        ),
    ),
  ];
};
