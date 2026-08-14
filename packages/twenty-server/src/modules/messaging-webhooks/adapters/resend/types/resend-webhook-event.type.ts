// tags are documented as an object map but have historically also appeared
// as { name, value } entries, so both shapes are accepted
export type ResendWebhookEventTags =
  | Record<string, string>
  | { name?: string; value?: string }[];

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
