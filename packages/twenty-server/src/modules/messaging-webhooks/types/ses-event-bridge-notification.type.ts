type SesEventBridgeDetailType =
  | 'Sending Status Enabled'
  | 'Sending Status Disabled'
  | 'Email Bounced'
  | 'Email Complaint Received';

type SesEventBridgeRecipient = {
  emailAddress: string;
};

export type SesEventBridgeNotification = {
  source: 'aws.ses';
  'detail-type': SesEventBridgeDetailType;
  resources?: string[];
  detail?: {
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
      bouncedRecipients?: SesEventBridgeRecipient[];
    };
    complaint?: {
      feedbackId?: string;
      complainedRecipients?: SesEventBridgeRecipient[];
    };
    mail?: {
      messageId?: string;
    };
  };
};
