import {
  isEmailDocumentShape,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

export const resolveEmailBody = async (
  body: string,
  context: Record<string, unknown>,
): Promise<string> => {
  const unresolvedDocument = parseJson<unknown>(body);

  if (!isEmailDocumentShape(unresolvedDocument)) {
    return resolveWorkflowEmailTemplateString(body, context, {
      escapeValues: false,
    });
  }

  const parseResult = parseEmailDocument(unresolvedDocument);

  if (!parseResult.success) {
    throw new Error(`Invalid workflow email document: ${parseResult.error}`);
  }

  return JSON.stringify(
    resolveEmailDocumentBindings(parseResult.document, (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
    ),
  );
};
