import { isNonEmptyString } from '@sniptt/guards';

export type MailgunInboundNotifyFields = {
  timestamp: string | undefined;
  token: string | undefined;
  signature: string | undefined;
  recipient: string | undefined;
  subject: string | undefined;
  messageUrl: string | undefined;
};

// Mailgun store(notify) posts application/x-www-form-urlencoded when the
// stored email has no attachments and multipart/form-data when it does.
// The urlencoded case arrives parsed by the global body parser; multipart
// is captured raw and only its text fields matter here.
export const parseMailgunInboundNotify = (
  body: unknown,
  contentType: string | undefined,
): MailgunInboundNotifyFields | null => {
  if (Buffer.isBuffer(body)) {
    const fields = parseMultipartTextFields(body, contentType ?? '');

    return fields ? pickNotifyFields(fields) : null;
  }

  if (typeof body === 'object' && body !== null) {
    return pickNotifyFields(body as Record<string, unknown>);
  }

  return null;
};

const pickNotifyFields = (
  fields: Record<string, unknown>,
): MailgunInboundNotifyFields => {
  return {
    timestamp: asString(fields.timestamp),
    token: asString(fields.token),
    signature: asString(fields.signature),
    recipient: asString(fields.recipient),
    subject: asString(fields.subject),
    messageUrl: asString(fields['message-url']),
  };
};

const asString = (value: unknown): string | undefined => {
  return isNonEmptyString(value) ? value : undefined;
};

const parseMultipartTextFields = (
  body: Buffer,
  contentType: string,
): Record<string, string> | null => {
  const boundaryMatch = /boundary="?([^";]+)"?/i.exec(contentType);

  if (!boundaryMatch || !isNonEmptyString(boundaryMatch[1])) {
    return null;
  }

  const parts = body.toString('utf8').split(`--${boundaryMatch[1]}`);
  const fields: Record<string, string> = {};

  for (const part of parts) {
    const headerBodySeparatorIndex = part.indexOf('\r\n\r\n');

    if (headerBodySeparatorIndex === -1) {
      continue;
    }

    const rawHeaders = part.slice(0, headerBodySeparatorIndex);

    // skip file parts, only plain text fields carry notify metadata
    if (/filename=/i.test(rawHeaders)) {
      continue;
    }

    const nameMatch = /Content-Disposition:[^\r\n]*\sname="([^"]+)"/i.exec(
      rawHeaders,
    );

    if (!nameMatch || !isNonEmptyString(nameMatch[1])) {
      continue;
    }

    fields[nameMatch[1]] = part
      .slice(headerBodySeparatorIndex + 4)
      .replace(/\r\n$/, '');
  }

  return fields;
};
