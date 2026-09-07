import { msg } from '@lingui/core/macro';
import {
  type EmailDocumentStringContext,
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
import { type EmailingDomainEmailTemplate } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-template.type';
import { CAMPAIGN_VARIABLE_PATTERN } from 'src/modules/emailing/constants/campaign-variable-pattern.constant';

const CAMPAIGN_BATCH_TAG_PREFIXES = {
  htmlEscaped: 'v_h',
  raw: 'v_t',
  urlEncoded: 'v_u',
} as const;

type CampaignBatchTagFamily = keyof typeof CAMPAIGN_BATCH_TAG_PREFIXES;

type CampaignBatchTagFamilyByContext = Record<
  EmailDocumentStringContext,
  CampaignBatchTagFamily
>;

const HTML_BODY_TAG_FAMILY_BY_CONTEXT: CampaignBatchTagFamilyByContext = {
  html: 'htmlEscaped',
  text: 'htmlEscaped',
  url: 'urlEncoded',
};

const PLAIN_TEXT_BODY_TAG_FAMILY_BY_CONTEXT: CampaignBatchTagFamilyByContext = {
  html: 'htmlEscaped',
  text: 'raw',
  url: 'urlEncoded',
};

export const compileCampaignBatchTemplate = async ({
  subjectTemplate,
  bodyTemplate,
}: {
  subjectTemplate: string;
  bodyTemplate: string;
}): Promise<{
  template: EmailingDomainEmailTemplate;
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

  const toTags = (value: string, tagFamily: CampaignBatchTagFamily): string =>
    value.replace(
      CAMPAIGN_VARIABLE_PATTERN,
      (_match, variableName) =>
        `{{${CAMPAIGN_BATCH_TAG_PREFIXES[tagFamily]}_${indexOfVariable(variableName)}}}`,
    );

  const subject = toTags(subjectTemplate, 'raw');

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

  const emailDocument = parseResult.document;

  const compileTaggedDocument = (
    tagFamilyByContext: CampaignBatchTagFamilyByContext,
  ) =>
    compileOutboundEmailContent(
      resolveEmailDocumentBindings(emailDocument, (value, context) =>
        toTags(value, tagFamilyByContext[context]),
      ),
    );

  const { html } = await compileTaggedDocument(HTML_BODY_TAG_FAMILY_BY_CONTEXT);
  const { plainText } = await compileTaggedDocument(
    PLAIN_TEXT_BODY_TAG_FAMILY_BY_CONTEXT,
  );

  return {
    template: { subject, text: plainText, html: isDefined(html) ? html : '' },
    variableNames,
  };
};
