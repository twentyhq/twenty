import { type SesEventBridgeNotification } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-event-bridge-notification.type';
import { type SesOutboundEventPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-payload.type';

type SesEventPublishingNotification = SesOutboundEventPayload & {
  eventType: string;
};

export type SesOutboundNotification =
  | SesEventBridgeNotification
  | SesEventPublishingNotification;
