import { parseJson, parseEmailDocument } from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

export const resolveEmailBody = async (
  body: string,
  context: Record<string, unknown>,
): Promise<string> => {
  const unresolvedDocument = parseJson<unknown>(body);
  const isDocument =
    typeof unresolvedDocument === 'object' &&
    unresolvedDocument !== null &&
    'type' in unresolvedDocument &&
    unresolvedDocument.type === 'doc';

  if (!isDocument) {
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
