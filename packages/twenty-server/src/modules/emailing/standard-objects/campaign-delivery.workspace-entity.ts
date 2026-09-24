import { type CampaignDeliveryState } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';
import { type CampaignFailureReason } from 'src/engine/core-modules/emailing-domain/types/campaign-failure-reason.type';
import { type CampaignSkipReason } from 'src/engine/core-modules/emailing-domain/types/campaign-skip-reason.type';

export class CampaignDeliveryWorkspaceEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  campaignId: string;
  personId: string;
  recipientEmail: string;
  state: CampaignDeliveryState;
  skipReason: CampaignSkipReason | null;
  failureReason: CampaignFailureReason | null;
  claimToken: string | null;
  claimExpiresAt: Date | null;
  providerMessageId: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  bouncedAt: Date | null;
  complainedAt: Date | null;
  rejectedAt: Date | null;
  renderingFailedAt: Date | null;
}
