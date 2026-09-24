type SesOutboundEventRecipient = {
  emailAddress: string;
};

export type SesOutboundEventPayload = {
  version?: string;
  data?: {
    origin?: string;
    record?: {
      status?: 'ENABLED' | 'DISABLED';
      cause?: string;
    };
  };
  bounce?: {
    bounceType?: 'Permanent' | 'Transient' | 'Undetermined';
    feedbackId?: string;
    bouncedRecipients?: SesOutboundEventRecipient[];
  };
  complaint?: {
    feedbackId?: string;
    complainedRecipients?: SesOutboundEventRecipient[];
  };
  mail?: {
    messageId?: string;
    tags?: Record<string, string[]>;
  };
};
