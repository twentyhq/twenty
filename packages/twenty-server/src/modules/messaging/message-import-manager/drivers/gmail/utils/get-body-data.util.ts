import { type gmail_v1 as gmailV1 } from 'googleapis';

type MessagePart = gmailV1.Schema$MessagePart;

type BodyData = {
  data: string;
  isHtml: boolean;
};

const MAX_PARTS_TO_PROCESS = 100;

export const getBodyData = (
  message: gmailV1.Schema$Message,
): BodyData | undefined => {
  const payload = message.payload;

  if (!payload) {
    return undefined;
  }

  const result: { textPlain?: string; textHtml?: string } = {};
  const parts: MessagePart[] = [payload];

  for (let i = 0; parts.length !== 0 && i < MAX_PARTS_TO_PROCESS; i++) {
    const part = parts.shift()!;

    if (part.parts) {
      parts.push(...part.parts);
    }

    if (!part.body?.data) {
      continue;
    }

    const isAttachment = Boolean(part.body.attachmentId && part.filename);

    if (isAttachment) {
      continue;
    }

    if (part.mimeType === 'text/plain') {
      result.textPlain = part.body.data;
    } else if (part.mimeType === 'text/html') {
      result.textHtml = part.body.data;
    }
  }

  if (result.textPlain) {
    return { data: result.textPlain, isHtml: false };
  }

  if (result.textHtml) {
    return { data: result.textHtml, isHtml: true };
  }

  return undefined;
};
