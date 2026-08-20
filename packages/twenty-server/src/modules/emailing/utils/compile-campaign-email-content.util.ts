import { msg } from '@lingui/core/macro';
import {
  isDefined,
  parseCanonicalEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { type CompiledOutboundEmailContent } from 'src/engine/core-modules/email/types/compiled-outbound-email-content.type';
import { compileOutboundEmailContent } from 'src/engine/core-modules/email/utils/compile-outbound-email-content.util';
import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

export const compileCampaignEmailContent = async (
  bodyTemplate: string,
  variables: Record<string, string> | null,
): Promise<CompiledOutboundEmailContent> => {
  if (bodyTemplate.trim() === '') {
    return { html: '', plainText: '' };
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

  return compileOutboundEmailContent(
    isDefined(variables)
      ? resolveEmailDocumentBindings(parseResult.document, (value, context) =>
          renderCampaignTemplate(value, variables, {
            escapeValues: context === 'html',
          }),
        )
      : parseResult.document,
  );
};
