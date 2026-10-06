import {
  convertEmailBodyToEmailDocument,
  type EmailDocument,
} from 'twenty-shared/utils';

export const buildEmailDocument = (text: string): EmailDocument => {
  const conversionResult = convertEmailBodyToEmailDocument(text);

  if (!conversionResult.success) {
    throw new Error(conversionResult.error);
  }

  return conversionResult.document;
};
