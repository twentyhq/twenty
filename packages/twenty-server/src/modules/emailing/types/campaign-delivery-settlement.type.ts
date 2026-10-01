import { type CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';

export type CampaignDeliverySettlement = Pick<
  CampaignDeliveryWorkspaceEntity,
  'state' | 'skipReason' | 'failureReason' | 'providerMessageId' | 'sentAt'
> & { deliveryId: string };
