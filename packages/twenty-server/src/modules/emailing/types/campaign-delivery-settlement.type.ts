import { type CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';

export type CampaignDeliverySettlement = Pick<
  CampaignDeliveryEntity,
  'state' | 'skipReason' | 'failureReason' | 'providerMessageId' | 'sentAt'
> & { deliveryId: string };
