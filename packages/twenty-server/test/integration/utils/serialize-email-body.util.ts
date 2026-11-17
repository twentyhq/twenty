import {
  convertEmailBodyInputToEmailDocument,
  type EmailBodyInput,
} from 'twenty-shared/utils';

export const serializeEmailBody = (body: EmailBodyInput): string =>
  JSON.stringify(convertEmailBodyInputToEmailDocument(body));
