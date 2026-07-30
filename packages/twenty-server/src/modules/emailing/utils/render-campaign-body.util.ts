import { type JSONContent } from '@tiptap/core';

import {
  isDefined,
  parseJson,
  TIPTAP_MARK_TYPES,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';

import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';
import {
  CAMPAIGN_VARIABLE_PATTERN,
  renderCampaignTemplate,
} from 'src/modules/emailing/utils/render-campaign-template.util';

// bodyTemplate is a plain text field, so anything can be written to it through
// the record API. The renderer maps over content without checking it, so a
// document carrying a non-array content would throw mid-send rather than fall
// back. A document with no content at all renders as empty and is fine.
const isRenderableDocument = (
  document: JSONContent | null,
): document is JSONContent =>
  isDefined(document) &&
  document.type === 'doc' &&
  (!isDefined(document.content) || Array.isArray(document.content));

const substituteIntoString = (
  value: string,
  variables: Record<string, string>,
): string =>
  value.replace(
    CAMPAIGN_VARIABLE_PATTERN,
    (_match, variableName: string) => variables[variableName] ?? '',
  );

const substituteVariables = (
  node: JSONContent,
  variables: Record<string, string>,
): JSONContent => ({
  ...node,
  ...(typeof node.text === 'string' && {
    text: substituteIntoString(node.text, variables),
  }),
  // Variable chips carry their placeholder in an attribute rather than in a
  // text node, and the renderer prints that attribute verbatim.
  ...(node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG &&
    typeof node.attrs?.variable === 'string' && {
      attrs: {
        ...node.attrs,
        variable: substituteIntoString(node.attrs.variable, variables),
      },
    }),
  // Button URLs are where per-recipient values matter most (tracking links,
  // per-person landing pages).
  ...(node.type === TIPTAP_NODE_TYPES.EMAIL_BUTTON &&
    typeof node.attrs?.href === 'string' && {
      attrs: {
        ...node.attrs,
        href: substituteIntoString(node.attrs.href, variables),
      },
    }),
  // Raw HTML blocks are emitted verbatim, so substituted values are escaped
  // to keep record data from injecting markup into the email.
  ...(node.type === TIPTAP_NODE_TYPES.EMAIL_HTML &&
    typeof node.attrs?.html === 'string' && {
      attrs: {
        ...node.attrs,
        html: renderCampaignTemplate(node.attrs.html, variables, {
          escapeValues: true,
        }),
      },
    }),
  ...(Array.isArray(node.marks) && {
    marks: node.marks.map((mark) =>
      mark.type === TIPTAP_MARK_TYPES.LINK &&
      typeof mark.attrs?.href === 'string'
        ? {
            ...mark,
            attrs: {
              ...mark.attrs,
              href: substituteIntoString(mark.attrs.href, variables),
            },
          }
        : mark,
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

  if (!isRenderableDocument(tipTapDocument)) {
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
