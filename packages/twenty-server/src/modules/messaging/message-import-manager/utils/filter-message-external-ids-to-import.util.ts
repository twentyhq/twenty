import { ConnectedAccountProvider } from 'twenty-shared/types';

export const filterMessageExternalIdsToImport = ({
  messageExternalIds,
  existingAssociations,
  provider,
}: {
  messageExternalIds: string[];
  existingAssociations: {
    messageExternalId: string | null;
    message: { isDraft: boolean } | null;
  }[];
  provider: ConnectedAccountProvider;
}): string[] => {
  // Microsoft keeps immutable IDs when drafts move to Sent Items.
  const existingMessageExternalIds = new Set(
    existingAssociations
      .filter(
        (association) =>
          provider !== ConnectedAccountProvider.MICROSOFT ||
          association.message?.isDraft !== true,
      )
      .map((association) => association.messageExternalId),
  );

  return messageExternalIds.filter(
    (externalId) => !existingMessageExternalIds.has(externalId),
  );
};
