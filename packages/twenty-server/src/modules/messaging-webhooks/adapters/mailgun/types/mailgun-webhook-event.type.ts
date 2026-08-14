export type MailgunOutboundWebhookPayload = {
  signature?: {
    timestamp?: string;
    token?: string;
    signature?: string;
  };
  'event-data'?: {
    id?: string;
    event?: string;
    severity?: string;
    recipient?: string;
    'user-variables'?: Record<string, string>;
    message?: {
      headers?: Record<string, string>;
    };
  };
};
