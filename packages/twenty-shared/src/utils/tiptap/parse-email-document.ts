import {
  type EmailDocument,
  emailDocumentSchema,
} from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';

type ParseEmailDocumentResult =
  | { success: true; document: EmailDocument }
  | { success: false; error: string };

export const parseEmailDocument = (
  value: unknown,
): ParseEmailDocumentResult => {
  const result = emailDocumentSchema.safeParse(value);

  if (result.success) {
    return { success: true, document: result.data };
  }

  const issues = result.error.issues
    .slice(0, 10)
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  return { success: false, error: issues };
};

export const parseCanonicalEmailDocument = (
  value: unknown,
): ParseEmailDocumentResult => {
  const result = parseEmailDocument(value);

  if (!result.success) {
    return result;
  }

  if (result.document.attrs?.schemaVersion !== EMAIL_DOCUMENT_SCHEMA_VERSION) {
    return {
      success: false,
      error: `attrs.schemaVersion: Expected ${EMAIL_DOCUMENT_SCHEMA_VERSION}`,
    };
  }

  return result;
};
