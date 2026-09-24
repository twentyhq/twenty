import { type SesOutboundEventPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-payload.type';

export type SesEventBridgeNotification = {
  source: 'aws.ses';
  'detail-type': string;
  resources?: string[];
  detail?: SesOutboundEventPayload;
};
