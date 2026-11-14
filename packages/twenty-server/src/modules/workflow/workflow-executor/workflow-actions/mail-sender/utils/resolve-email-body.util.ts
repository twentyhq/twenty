import {
  type EmailDocument,
  getFullHtmlEmailIfWholeBody,
  isDefined,
  isEmailDocumentShape,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

const parseSerializedEmailDocumentOrThrow = (
  serializedDocument: string,
): EmailDocument => {
  const parseResult = parseEmailDocument(
    parseJson<unknown>(serializedDocument),
  );

  if (!parseResult.success) {
    throw new Error(`Invalid workflow email document: ${parseResult.error}`);
  }

  return parseResult.document;
};

// The step body is a serialized email document; a whole-body variable may itself hold one.
export const resolveEmailBody = (
  body: string,
  context: Record<string, unknown>,
): EmailDocument => {
  const documentWithVariableValues = resolveEmailDocumentBindings(
    parseSerializedEmailDocumentOrThrow(body),
    (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
  );

  const fullHtmlEmail = getFullHtmlEmailIfWholeBody(documentWithVariableValues);

  return isDefined(fullHtmlEmail) &&
    isEmailDocumentShape(parseJson<unknown>(fullHtmlEmail))
    ? parseSerializedEmailDocumentOrThrow(fullHtmlEmail)
    : documentWithVariableValues;
};
