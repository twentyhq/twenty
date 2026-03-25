import { type gmail_v1 as gmailV1 } from 'googleapis';

export const getBodyData = (message: gmailV1.Schema$Message) => {
  const firstPart = message.payload?.parts?.[0];

  if (firstPart?.mimeType === 'text/plain') {
    return firstPart?.body?.data;
  }

  return firstPart?.parts?.find((part) => part.mimeType === 'text/plain')?.body
    ?.data;
};
