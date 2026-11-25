import {
  type EmailDocument,
  getFullHtmlEmailIfWholeBody,
  isDefined,
  isEmailDocumentShape,
  parseJson,
} from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import { parseEmailDocumentOrThrow } from 'src/engine/core-modules/tool/tools/email-tool/utils/parse-email-document-or-throw.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

// A whole-body variable may itself hold a serialized email document
export const resolveEmailBody = ({
  body,
  context,
}: {
  body: string;
  context: Record<string, unknown>;
}): EmailDocument => {
  const documentWithVariableValues = resolveEmailDocumentBindings(
    parseEmailDocumentOrThrow(parseJson<unknown>(body)),
    (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
  );

  const fullHtmlEmail = getFullHtmlEmailIfWholeBody(documentWithVariableValues);
  const documentFromVariableValue = isDefined(fullHtmlEmail)
    ? parseJson<unknown>(fullHtmlEmail)
    : undefined;

  return isEmailDocumentShape(documentFromVariableValue)
    ? parseEmailDocumentOrThrow(documentFromVariableValue)
    : documentWithVariableValues;
};
