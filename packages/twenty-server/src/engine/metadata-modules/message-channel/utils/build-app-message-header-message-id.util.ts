import { APP_MESSAGE_HEADER_MESSAGE_ID_PREFIX } from 'twenty-shared/constants';

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
}): string =>
  `${APP_MESSAGE_HEADER_MESSAGE_ID_PREFIX}${applicationId}:${messageChannelId}:${externalId}`;
