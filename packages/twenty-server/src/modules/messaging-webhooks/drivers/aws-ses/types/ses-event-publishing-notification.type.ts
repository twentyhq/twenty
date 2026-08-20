import { type SesOutboundEventPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-payload.type';

export type SesEventPublishingNotification = SesOutboundEventPayload & {
  eventType: string;
};
