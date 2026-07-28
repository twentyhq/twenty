import { type JSONContent } from '@tiptap/core';

import { isDefined, parseJson } from 'twenty-shared/utils';

import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';
import {
  CAMPAIGN_VARIABLE_PATTERN,
  renderCampaignTemplate,
} from 'src/modules/emailing/utils/render-campaign-template.util';

const substituteVariables = (
  node: JSONContent,
  variables: Record<string, string>,
): JSONContent => ({
  ...node,
  ...(typeof node.text === 'string' && {
    text: node.text.replace(
      CAMPAIGN_VARIABLE_PATTERN,
      (_match, variableName: string) => variables[variableName] ?? '',
    ),
  }),
  ...(Array.isArray(node.content) && {
    content: node.content.map((childNode) =>
      substituteVariables(childNode, variables),
    ),
  }),
});

// Bodies authored in the campaign composer are TipTap JSON and go through
// react-email, which emits the table markup Outlook needs. Bodies authored
// before the composer moved to JSON are HTML strings and keep the old
// string-interpolation path. Pass null variables to render the template with
// its placeholders left in place.
export const renderCampaignBodyToHtml = async (
  bodyTemplate: string,
  variables: Record<string, string> | null,
): Promise<string> => {
  const tipTapDocument = parseJson<JSONContent>(bodyTemplate);

  if (!isDefined(tipTapDocument) || tipTapDocument.type !== 'doc') {
    return isDefined(variables)
      ? renderCampaignTemplate(bodyTemplate, variables, { escapeValues: true })
      : bodyTemplate;
  }

  // Values are substituted into text nodes rather than into the serialized
  // JSON, so a value containing quotes or braces cannot corrupt the document.
  // react-email escapes them when it renders.
  return renderRichTextToHtml(
    isDefined(variables)
      ? substituteVariables(tipTapDocument, variables)
      : tipTapDocument,
  );
};
