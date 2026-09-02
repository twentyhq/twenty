import { msg } from '@lingui/core/macro';
import {
  isDefined,
  parseCanonicalEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { compileOutboundEmailContent } from 'src/engine/core-modules/email/utils/compile-outbound-email-content.util';
import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { CAMPAIGN_VARIABLE_PATTERN } from 'src/modules/emailing/constants/campaign-variable-pattern.constant';

const buildTagName = (index: number, isHtmlContext: boolean): string =>
  `v_${isHtmlContext ? 'h' : 't'}_${index}`;

export const compileCampaignBatchTemplate = async ({
  subjectTemplate,
  bodyTemplate,
}: {
  subjectTemplate: string;
  bodyTemplate: string;
}): Promise<{
  template: { subject: string; text: string; html?: string };
  variableNames: string[];
}> => {
  const variableNames: string[] = [];

  const indexOfVariable = (variableName: string): number => {
    const existingIndex = variableNames.indexOf(variableName);

    if (existingIndex !== -1) {
      return existingIndex;
    }

    return variableNames.push(variableName) - 1;
  };

  const toTags = (value: string, isHtmlContext: boolean): string =>
    value.replace(
      CAMPAIGN_VARIABLE_PATTERN,
      (_match, variableName) =>
        `{{${buildTagName(indexOfVariable(variableName), isHtmlContext)}}}`,
    );

  const subject = toTags(subjectTemplate, false);

  if (bodyTemplate.trim() === '') {
    return { template: { subject, text: '', html: '' }, variableNames };
  }

  const parseResult = parseCanonicalEmailDocument(
    parseJson<unknown>(bodyTemplate),
  );

  if (!parseResult.success) {
    throw new EmailingDomainException(
      `Campaign bodyTemplate is not a renderable email document: ${parseResult.error}`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      { userFriendlyMessage: msg`This campaign's email content is invalid.` },
    );
  }

  const { html, plainText } = await compileOutboundEmailContent(
    resolveEmailDocumentBindings(parseResult.document, (value, context) =>
      toTags(value, context === 'html'),
    ),
  );

  return {
    template: { subject, text: plainText, html: isDefined(html) ? html : '' },
    variableNames,
  };
};
