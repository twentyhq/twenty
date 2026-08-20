import { type SesOutboundEventUnprocessableReason } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-unprocessable-reason.type';
import { type NormalizedOutboundDeliveryEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-delivery-event.type';
import { type NormalizedOutboundSendingStateEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-sending-state-event.type';

export type NormalizedSesOutboundEvent =
  | {
      status: 'DELIVERY';
      delivery: Omit<NormalizedOutboundDeliveryEvent, 'dedupeKey'>;
    }
  | {
      status: 'SENDING_STATE';
      sendingState: NormalizedOutboundSendingStateEvent;
    }
  | {
      status: 'UNPROCESSABLE';
      eventName: string;
      reason: SesOutboundEventUnprocessableReason;
    };
