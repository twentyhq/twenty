import {
  type EmailDocument,
  getEmailDocumentStandaloneHtml,
  isDefined,
  parseEmailBodyAsEmailDocument,
} from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

const parseEmailDocumentOrThrow = (body: string): EmailDocument => {
  const parseResult = parseEmailBodyAsEmailDocument(body);

  if (!parseResult.success) {
    throw new Error(`Invalid workflow email document: ${parseResult.error}`);
  }

  return parseResult.document;
};

export const resolveEmailBody = async (
  body: string,
  context: Record<string, unknown>,
): Promise<string> => {
  const resolvedDocument = resolveEmailDocumentBindings(
    parseEmailDocumentOrThrow(body),
    (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
  );

  const resolvedStandaloneHtml =
    getEmailDocumentStandaloneHtml(resolvedDocument);

  return JSON.stringify(
    isDefined(resolvedStandaloneHtml)
      ? parseEmailDocumentOrThrow(resolvedStandaloneHtml)
      : resolvedDocument,
  );
};
