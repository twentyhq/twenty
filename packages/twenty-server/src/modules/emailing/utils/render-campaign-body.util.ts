import {
  isDefined,
  parseJson,
  parseEmailDocument,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

import { renderEmailBodyToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-email-body.util';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

// Bodies authored in the campaign composer are TipTap JSON and go through
// react-email, which emits the table markup Outlook needs. Pass null
// variables to render the template with its placeholders left in place.
export const renderCampaignBodyToHtml = async (
  bodyTemplate: string,
  variables: Record<string, string> | null,
): Promise<string> => {
  // Drafts start out with no body, and previewing one must not throw.
  if (bodyTemplate.trim() === '') {
    return '';
  }

  const parseResult = parseEmailDocument(parseJson<unknown>(bodyTemplate));

  if (!parseResult.success) {
    throw new Error('Campaign bodyTemplate is not a renderable email document');
  }

  // Values are substituted into text nodes rather than into the serialized
  // JSON, so a value containing quotes or braces cannot corrupt the document.
  // react-email escapes them when it renders.
  return renderEmailBodyToHtml(
    isDefined(variables)
      ? transformEmailDocumentStrings(parseResult.document, (value, context) =>
          renderCampaignTemplate(value, variables, {
            escapeValues: context === 'html',
          }),
        )
      : parseResult.document,
  );
};
