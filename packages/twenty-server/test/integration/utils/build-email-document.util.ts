import {
  convertEmailBodyInputToEmailDocument,
  type EmailDocument,
} from 'twenty-shared/utils';

export const buildEmailDocument = (text: string): EmailDocument =>
  convertEmailBodyInputToEmailDocument({ type: 'text', text });
