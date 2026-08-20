import { type CampaignMessageRecipient } from 'src/modules/emailing/types/campaign-message-recipient.type';

export type CampaignMessageRow = {
  recipient: CampaignMessageRecipient;
  messageId: string;
  threadId: string;
  temporaryExternalId: string;
};
