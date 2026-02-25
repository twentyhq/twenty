import { type gmail_v1 as gmailV1 } from 'googleapis';

export const getHtmlBodyData = (message: gmailV1.Schema$Message) => {
  if (message.payload?.mimeType === 'text/html') {
    return message.payload?.body?.data;
  }

  const firstPart = message.payload?.parts?.[0];

  if (firstPart?.mimeType === 'text/html') {
    return firstPart?.body?.data;
  }

  const nestedHtmlPart = firstPart?.parts?.find(
    (part) => part.mimeType === 'text/html',
  );

  if (nestedHtmlPart) {
    return nestedHtmlPart?.body?.data;
  }

  return message.payload?.parts?.find((part) => part.mimeType === 'text/html')
    ?.body?.data;
};
