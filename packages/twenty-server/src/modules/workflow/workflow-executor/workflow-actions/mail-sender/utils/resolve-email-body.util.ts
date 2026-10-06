import {
  convertEmailBodyToEmailDocument,
  type EmailDocument,
  getFullHtmlEmailIfWholeBody,
  isDefined,
  isEmailDocumentShape,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

const parseIfSerializedEmailDocument = (
  text: string,
): EmailDocument | undefined => {
  const textAsJson = parseJson<unknown>(text);

  if (!isEmailDocumentShape(textAsJson)) {
    return undefined;
  }

  const parseResult = parseEmailDocument(textAsJson);

  if (!parseResult.success) {
    throw new Error(`Invalid workflow email document: ${parseResult.error}`);
  }

  return parseResult.document;
};

export const resolveEmailBody = async (
  body: string,
  context: Record<string, unknown>,
): Promise<string> => {
  const conversionResult = convertEmailBodyToEmailDocument(body);

  if (!conversionResult.success) {
    throw new Error(
      `Invalid workflow email document: ${conversionResult.error}`,
    );
  }

  const documentWithVariableValues = resolveEmailDocumentBindings(
    conversionResult.document,
    (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
  );

  const fullHtmlEmail = getFullHtmlEmailIfWholeBody(documentWithVariableValues);
  const emailDocumentFromVariableValue = isDefined(fullHtmlEmail)
    ? parseIfSerializedEmailDocument(fullHtmlEmail)
    : undefined;

  return JSON.stringify(
    emailDocumentFromVariableValue ?? documentWithVariableValues,
  );
};
