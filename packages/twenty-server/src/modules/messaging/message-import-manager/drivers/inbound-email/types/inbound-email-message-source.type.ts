export const INBOUND_EMAIL_MESSAGE_SOURCE = {
  SES_S3: 'SES_S3',
} as const;

export type InboundEmailMessageSource =
  (typeof INBOUND_EMAIL_MESSAGE_SOURCE)[keyof typeof INBOUND_EMAIL_MESSAGE_SOURCE];

export type InboundEmailMessageReference = {
  source: InboundEmailMessageSource;
  reference: string;
};
