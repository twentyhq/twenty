import { type ResendWebhookEventTags } from 'src/modules/messaging-webhooks/drivers/resend/types/resend-webhook-event-tags.type';

export type ResendWebhookEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    received_for?: string[];
    subject?: string;
    message_id?: string;
    tags?: ResendWebhookEventTags;
    bounce?: {
      type?: 'Permanent' | 'Transient' | 'Undetermined';
      subType?: string;
      message?: string;
    };
  };
};
