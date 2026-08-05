import {
  type EmailDocument,
  emailDocumentSchema,
} from './email-document-schema';

export const parseEmailDocument = (
  value: unknown,
):
  | { success: true; document: EmailDocument }
  | { success: false; error: string } => {
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
