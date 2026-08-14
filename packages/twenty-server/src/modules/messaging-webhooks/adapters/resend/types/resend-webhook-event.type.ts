type ResendWebhookEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.bounced'
  | 'email.complained'
  | 'email.failed'
  | 'email.delivery_delayed'
  | 'email.received';

export type ResendWebhookEvent = {
  type: ResendWebhookEventType | string;
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
    tags?: Record<string, string>;
    bounce?: {
      type?: 'Permanent' | 'Transient' | 'Undetermined';
      subType?: string;
      message?: string;
    };
  };
};
