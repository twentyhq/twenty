import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';

export type CampaignMessageRecipient = CampaignRecipient & {
  messageId: string;
};
