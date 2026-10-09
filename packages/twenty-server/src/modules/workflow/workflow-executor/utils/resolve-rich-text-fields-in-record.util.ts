import { isString } from '@sniptt/guards';
import { richTextValueSchema } from 'twenty-shared/types';
import {
  convertTipTapBlocksToMarkdown,
  isDefined,
  resolveRichTextVariables,
  resolveStringTemplate,
} from 'twenty-shared/utils';

import { convertMarkdownToBlocknoteBlocks } from 'src/engine/core-modules/record-transformer/utils/convert-markdown-to-blocknote-blocks.util';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

export const resolveRichTextFieldsInRecord = (
  objectRecord: Record<string, unknown>,
  objectMetadataInfo: Pick<
    ObjectMetadataInfo,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  >,
  context: Record<string, unknown>,
): Record<string, unknown> => {
  const richTextFieldNames = findRichTextFieldNames(objectMetadataInfo);

  const resolvedRecord = { ...objectRecord };

  for (const fieldName of richTextFieldNames) {
    const parsedRichTextValue = richTextValueSchema.safeParse(
      resolvedRecord[fieldName],
    );

    if (!parsedRichTextValue.success) {
      continue;
    }

    const { blocknote: tipTapJson, markdown } = parsedRichTextValue.data;

    const resolvedTipTapJson = resolveRichTextVariables(tipTapJson, context);
    const tipTapMarkdown = isDefined(resolvedTipTapJson)
      ? convertTipTapBlocksToMarkdown(resolvedTipTapJson)
      : undefined;

    resolvedRecord[fieldName] = isDefined(tipTapMarkdown)
      ? {
          blocknote: JSON.stringify(
            convertMarkdownToBlocknoteBlocks(tipTapMarkdown),
          ),
          markdown: tipTapMarkdown,
        }
      : {
          blocknote: null,
          markdown: isString(markdown)
            ? resolveStringTemplate(markdown, context)
            : markdown,
        };
  }

  return resolvedRecord;
};
