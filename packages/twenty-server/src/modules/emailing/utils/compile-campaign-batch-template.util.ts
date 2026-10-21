import { msg } from '@lingui/core/macro';
import {
  type EmailDocumentStringContext,
  isDefined,
  parseCanonicalEmailDocument,
  parseJson,
  replaceTemplateVariables,
  type TemplateVariableWithFallback,
} from 'twenty-shared/utils';

import { compileOutboundEmailContent } from 'src/engine/core-modules/email/utils/compile-outbound-email-content.util';
import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type EmailingDomainEmailTemplate } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-template.type';

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
  rawHtml: 'htmlEscaped',
  text: 'htmlEscaped',
  url: 'urlEncoded',
};

const PLAIN_TEXT_BODY_TAG_FAMILY_BY_CONTEXT: CampaignBatchTagFamilyByContext = {
  html: 'htmlEscaped',
  rawHtml: 'htmlEscaped',
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
  plainTextSourceHtml: string;
  campaignVariables: TemplateVariableWithFallback[];
}> => {
  const campaignVariables: TemplateVariableWithFallback[] = [];

  const indexOfVariable = (
    campaignVariable: TemplateVariableWithFallback,
  ): number => {
    const existingIndex = campaignVariables.findIndex(
      ({ name, fallback }) =>
        name === campaignVariable.name &&
        fallback === campaignVariable.fallback,
    );

    if (existingIndex !== -1) {
      return existingIndex;
    }

    return campaignVariables.push(campaignVariable) - 1;
  };

  const toTags = (value: string, tagFamily: CampaignBatchTagFamily): string =>
    replaceTemplateVariables(
      value,
      (campaignVariable) =>
        `{{${CAMPAIGN_BATCH_TAG_PREFIXES[tagFamily]}_${indexOfVariable(campaignVariable)}}}`,
    );

  const subject = toTags(subjectTemplate, 'raw');

  if (bodyTemplate.trim() === '') {
    return {
      template: { subject, text: '', html: '' },
      plainTextSourceHtml: '',
      campaignVariables,
    };
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
  const { html: plainTextSourceHtml, plainText } = await compileTaggedDocument(
    PLAIN_TEXT_BODY_TAG_FAMILY_BY_CONTEXT,
  );

  return {
    template: { subject, text: plainText, html: isDefined(html) ? html : '' },
    plainTextSourceHtml: isDefined(plainTextSourceHtml)
      ? plainTextSourceHtml
      : '',
    campaignVariables,
  };
};
