import { type SESv2Client } from '@aws-sdk/client-sesv2';

export type FlociSesDriver = {
  sesClient: SESv2Client;
  restore: () => Promise<void>;
};
