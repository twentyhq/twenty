export type InboundRawEventChannel =
  | 'PBX'
  | 'ROISTAT'
  | 'CHATWOOT'
  | 'META_LEADGEN'
  | 'FORM'
  | 'OTHER';

export type InboundRawEventStatus =
  | 'RECEIVED'
  | 'ENQUEUED'
  | 'IGNORED'
  | 'FAILED';
