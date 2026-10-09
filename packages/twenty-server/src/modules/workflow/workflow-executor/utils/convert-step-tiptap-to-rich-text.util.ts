import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  type RichTextMetadata,
  richTextValueSchema,
} from 'twenty-shared/types';
import {
  convertTipTapBlocksToMarkdown,
  isDefined,
  resolveRichTextVariables,
  resolveStringTemplate,
} from 'twenty-shared/utils';

import { convertMarkdownToBlocknote } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

// The step editor is TipTap but saves its JSON under a key named blocknote
const workflowStepTipTapValueSchema = richTextValueSchema;

export const convertStepTipTapToRichText = (
  stepObjectRecord: Record<string, unknown>,
  objectMetadataInfo: Pick<
    ObjectMetadataInfo,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  >,
  context: Record<string, unknown>,
): Record<string, unknown> => {
  const richTextFieldNames = findRichTextFieldNames(objectMetadataInfo);

  const objectRecord = { ...stepObjectRecord };

  for (const fieldName of richTextFieldNames) {
    const parsedStepValue = workflowStepTipTapValueSchema.safeParse(
      stepObjectRecord[fieldName],
    );

    if (!parsedStepValue.success) {
      continue;
    }

    const { blocknote: tipTapJson, markdown: stepMarkdown } =
      parsedStepValue.data;

    const resolvedTipTapJson = resolveRichTextVariables(tipTapJson, context);
    const tipTapMarkdown = isDefined(resolvedTipTapJson)
      ? convertTipTapBlocksToMarkdown(resolvedTipTapJson)
      : undefined;

    const markdown =
      tipTapMarkdown ??
      (isString(stepMarkdown)
        ? resolveStringTemplate(stepMarkdown, context)
        : null);

    const richTextValue: RichTextMetadata = {
      markdown,
      blocknote: isNonEmptyString(markdown)
        ? convertMarkdownToBlocknote(markdown)
        : null,
    };

    objectRecord[fieldName] = richTextValue;
  }

  return objectRecord;
};
