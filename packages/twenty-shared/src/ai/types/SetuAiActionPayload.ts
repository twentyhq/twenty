// The canonical payload a reviewer approves. Execution uses exactly this
// revision; an edit creates a new revision instead of changing it.
export type SetuSendEmailActionPayload = {
  connectedAccountId: string;
  senderHandle: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
};

export type SetuRecordFieldChange = {
  fieldName: string;
  fieldLabel: string;
  before: unknown;
  after: unknown;
};

export type SetuUpdateRecordFieldsActionPayload = {
  objectNameSingular: string;
  objectLabel: string;
  recordId: string;
  recordLabel: string;
  changes: SetuRecordFieldChange[];
};

export type SetuAiActionPayload =
  | { kind: 'send_email'; payload: SetuSendEmailActionPayload }
  | {
      kind: 'update_record_fields';
      payload: SetuUpdateRecordFieldsActionPayload;
    };
