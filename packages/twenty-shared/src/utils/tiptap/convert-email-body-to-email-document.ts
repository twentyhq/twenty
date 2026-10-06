import { isString } from '@sniptt/guards';

import { parseJson } from '@/utils/parseJson';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

import { convertStringBodyToEmailDocument } from './convert-string-body-to-email-document';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { isEmailDocumentShape } from './is-email-document-shape';
import { parseEmailDocument } from './parse-email-document';

export const convertEmailBodyToEmailDocument = (emailBody: unknown) => {
  const emailBodyAsJson = isString(emailBody)
    ? parseJson<unknown>(emailBody)
    : emailBody;

  if (!isEmailDocumentShape(emailBodyAsJson)) {
    return isString(emailBody)
      ? {
          success: true as const,
          document: convertStringBodyToEmailDocument(emailBody),
        }
      : parseEmailDocument(emailBodyAsJson);
  }

  const existingAttributes =
    'attrs' in emailBodyAsJson && isPlainObject(emailBodyAsJson.attrs)
      ? emailBodyAsJson.attrs
      : {};

  return parseEmailDocument({
    ...emailBodyAsJson,
    attrs: {
      ...existingAttributes,
      schemaVersion:
        existingAttributes.schemaVersion ?? EMAIL_DOCUMENT_SCHEMA_VERSION,
    },
  });
};
