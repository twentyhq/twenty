import {
  type EmailDocument,
  isDefined,
  parseJson,
  parseEmailDocument,
  resolveRichTextVariables,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

import { renderEmailBodyToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-email-body.util';
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

  // Preserve the existing variable-chip behavior, including turning multiline
  // values into hard breaks, then resolve variables from block attributes via
  // the same structural traversal campaigns use.
  const bodyWithResolvedVariables = resolveRichTextVariables(body, context);
  const tipTapDocument = isDefined(bodyWithResolvedVariables)
    ? parseJson<EmailDocument>(bodyWithResolvedVariables)
    : null;

  if (!isDefined(tipTapDocument)) {
    throw new Error('Workflow email document could not be resolved');
  }

  return renderEmailBodyToHtml(
    transformEmailDocumentStrings(tipTapDocument, (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
    ),
  );
};
