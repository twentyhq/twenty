import { type NormalizedOutboundDeliveryEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-delivery-event.type';

export type OutboundDeliveryOutcome = Pick<
  NormalizedOutboundDeliveryEvent,
  'deliveryStatus' | 'suppression' | 'providerEventId'
>;
