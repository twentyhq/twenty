import { type SesEventBridgeNotification } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-event-bridge-notification.type';
import { type SesEventPublishingNotification } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-event-publishing-notification.type';

export type SesOutboundNotification =
  | SesEventBridgeNotification
  | SesEventPublishingNotification;
