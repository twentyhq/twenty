import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import { truncateStringToUtf8ByteBudget } from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const MAX_BODY_PREVIEW_BYTES = 8_000;

export type EmailStepLogMode = 'SEND' | 'DRAFT';

const splitRecipients = (raw: string | undefined): string[] => {
  if (raw === undefined || raw === null) {
    return [];
  }

  return raw
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const pickRecipients = (
  inputValue: string | undefined,
  outputValue: unknown,
): string[] => {
  if (isStringArray(outputValue)) {
    return outputValue;
  }

  return splitRecipients(inputValue);
};

const truncateBody = (body: string | undefined) => {
  if (body === undefined || body === null || body.length === 0) {
    return {
      bodyPreview: undefined,
      bodyBytes: undefined,
      bodyTruncated: false,
    };
  }

  const { value, originalBytes, truncated } = truncateStringToUtf8ByteBudget(
    body,
    MAX_BODY_PREVIEW_BYTES,
  );

  return {
    bodyPreview: value,
    bodyBytes: originalBytes,
    bodyTruncated: truncated,
  };
};

const extractString = (output: ToolOutput, key: string): string | undefined => {
  if (!output.result || typeof output.result !== 'object') {
    return undefined;
  }

  const value = (output.result as Record<string, unknown>)[key];

  return typeof value === 'string' ? value : undefined;
};

const extractNumber = (output: ToolOutput, key: string): number | undefined => {
  if (!output.result || typeof output.result !== 'object') {
    return undefined;
  }

  const value = (output.result as Record<string, unknown>)[key];

  return typeof value === 'number' ? value : undefined;
};

const extractRecipientsField = (output: ToolOutput, key: string): unknown => {
  if (!output.result || typeof output.result !== 'object') {
    return undefined;
  }

  return (output.result as Record<string, unknown>)[key];
};

export const buildEmailStepLog = ({
  mode,
  input,
  output,
  durationMs,
}: {
  mode: EmailStepLogMode;
  input: WorkflowSendEmailActionInput;
  output: ToolOutput;
  durationMs: number;
}): WorkflowRunStepLog => {
  const to = pickRecipients(
    input.recipients?.to,
    extractRecipientsField(output, 'recipients'),
  );
  const cc = pickRecipients(
    input.recipients?.cc,
    extractRecipientsField(output, 'ccRecipients'),
  );
  const bcc = pickRecipients(
    input.recipients?.bcc,
    extractRecipientsField(output, 'bccRecipients'),
  );

  const subject = extractString(output, 'subject') ?? input.subject;
  const connectedAccountId =
    extractString(output, 'connectedAccountId') ?? input.connectedAccountId;
  const attachmentCount = extractNumber(output, 'attachmentCount');

  const bodyForLog =
    extractString(output, 'sanitizedHtmlBody') ??
    extractString(output, 'plainTextBody') ??
    input.body;
  const body = truncateBody(bodyForLog);

  return {
    details: {
      type: 'EMAIL',
      mode,
      status: output.success ? 'SUCCESS' : 'ERROR',
      recipients: {
        to,
        cc: cc.length > 0 ? cc : undefined,
        bcc: bcc.length > 0 ? bcc : undefined,
      },
      subject,
      bodyPreview: body.bodyPreview,
      bodyBytes: body.bodyBytes,
      bodyTruncated: body.bodyTruncated,
      connectedAccountId,
      attachmentCount,
      inReplyTo: input.inReplyTo,
      error: output.error,
      durationMs,
    },
    entries: [],
    sizeBytes: 0,
  };
};
