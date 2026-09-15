import { type CampaignAudienceResolution } from 'src/engine/core-modules/emailing-domain/types/campaign-audience-resolution.type';
import { type MessageCampaignStatus } from 'twenty-shared/types';

export type PreparedCampaignSend = {
  roleId: string;
  emailingDomainId: string;
  messageChannelId: string;
  sendableRecipients: CampaignAudienceResolution['sendableRecipients'];
  audience: CampaignAudienceResolution['audience'];
  expectedStatus: MessageCampaignStatus;
  expectedScheduledAt: Date | null;
};
