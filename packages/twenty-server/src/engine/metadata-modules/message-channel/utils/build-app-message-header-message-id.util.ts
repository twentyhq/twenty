// the save path dedupes on headerMessageId workspace-wide, but provider ids are often only unique per conversation or account
// scoped to the channel: members in one provider conversation get separate Messages rather than one crossing sharing policies
export const buildAppMessageHeaderMessageId = ({
  applicationId,
  messageChannelId,
  externalId,
}: {
  applicationId: string;
  messageChannelId: string;
  externalId: string;
}): string => `app:${applicationId}:${messageChannelId}:${externalId}`;
