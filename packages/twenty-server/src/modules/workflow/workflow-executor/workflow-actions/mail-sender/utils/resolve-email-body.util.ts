import type { JSONContent } from '@tiptap/core';

import {
  isDefined,
  parseJson,
  resolveRichTextVariables,
} from 'twenty-shared/utils';

import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';

export const resolveEmailBody = async (
  body: string,
  context: Record<string, unknown>,
): Promise<string> => {
  const bodyWithResolvedVariables = resolveRichTextVariables(body, context);
  const tipTapDocument = isDefined(bodyWithResolvedVariables)
    ? parseJson<JSONContent>(bodyWithResolvedVariables)
    : null;

  if (isDefined(tipTapDocument) && tipTapDocument.type === 'doc') {
    return renderRichTextToHtml(tipTapDocument);
  }

  return bodyWithResolvedVariables ?? body;
};
