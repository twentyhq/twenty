import {
  type EmailDocument,
  getEmailDocumentStandaloneHtml,
  isDefined,
  isEmailDocumentShape,
  parseEmailBodyAsEmailDocument,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

const parseEmailDocumentHeldByResolvedHtml = (
  resolvedHtml: string,
): EmailDocument | undefined => {
  const value = parseJson<unknown>(resolvedHtml);

  if (!isEmailDocumentShape(value)) {
    return undefined;
  }

  const parseResult = parseEmailDocument(value);

  if (!parseResult.success) {
    throw new Error(`Invalid workflow email document: ${parseResult.error}`);
  }

  return parseResult.document;
};

export const resolveEmailBody = async (
  body: string,
  context: Record<string, unknown>,
): Promise<string> => {
  const parseResult = parseEmailBodyAsEmailDocument(body);

  if (!parseResult.success) {
    throw new Error(`Invalid workflow email document: ${parseResult.error}`);
  }

  const resolvedDocument = resolveEmailDocumentBindings(
    parseResult.document,
    (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
  );

  const resolvedHtml = getEmailDocumentStandaloneHtml(resolvedDocument);
  const documentHeldByResolvedHtml = isDefined(resolvedHtml)
    ? parseEmailDocumentHeldByResolvedHtml(resolvedHtml)
    : undefined;

  return JSON.stringify(documentHeldByResolvedHtml ?? resolvedDocument);
};
