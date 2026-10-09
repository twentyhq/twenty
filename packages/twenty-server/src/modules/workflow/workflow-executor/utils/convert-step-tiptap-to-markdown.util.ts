import { isString } from '@sniptt/guards';
import { richTextValueSchema } from 'twenty-shared/types';
import {
  convertTipTapBlocksToMarkdown,
  isDefined,
  resolveRichTextVariables,
  resolveStringTemplate,
} from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

// The step editor is TipTap but saves its JSON under a key named blocknote
const workflowStepTipTapValueSchema = richTextValueSchema;

export const convertStepTipTapToMarkdown = (
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

    const { blocknote, markdown } = parsedStepValue.data;

    const resolvedBlocknote = resolveRichTextVariables(blocknote, context);
    const tipTapMarkdown = isDefined(resolvedBlocknote)
      ? convertTipTapBlocksToMarkdown(resolvedBlocknote)
      : undefined;

    // TODO: steps built through the API can hold markdown only, BlockNote or a variable instead of TipTap.
    // Migrate them to TipTap so they go through the same conversion, then remove this branch.
    if (!isDefined(tipTapMarkdown)) {
      objectRecord[fieldName] = {
        blocknote,
        markdown: isString(markdown)
          ? resolveStringTemplate(markdown, context)
          : markdown,
      };
      continue;
    }

    objectRecord[fieldName] = {
      markdown: resolveStringTemplate(tipTapMarkdown, context),
    };
  }

  return objectRecord;
};
