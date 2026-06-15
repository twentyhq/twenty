import { type SESMessage } from 'aws-lambda';

export type SesInboundNotification = SESMessage & {
  notificationType?: string;
};
