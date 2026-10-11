import { richTextValueSchema } from 'twenty-shared/types';
import { convertTipTapBlocksToMarkdown, isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

// The step editor is TipTap but saves its JSON under a key named blocknote
const workflowStepTipTapValueSchema = richTextValueSchema;

export const convertStepObjectRecordTipTapToMarkdown = (
  stepObjectRecord: Record<string, unknown>,
  objectMetadataInfo: Pick<
    ObjectMetadataInfo,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  >,
): Record<string, unknown> => {
  const objectRecord = { ...stepObjectRecord };

  for (const fieldName of findRichTextFieldNames(objectMetadataInfo)) {
    const parsedStepValue = workflowStepTipTapValueSchema.safeParse(
      stepObjectRecord[fieldName],
    );

    const tipTapJson = parsedStepValue.success
      ? parsedStepValue.data.blocknote
      : undefined;
    const tipTapMarkdown = isDefined(tipTapJson)
      ? convertTipTapBlocksToMarkdown(tipTapJson)
      : undefined;

    // TODO: steps built through the API can hold markdown only, BlockNote or a variable instead of TipTap.
    // Migrate them to TipTap so they go through the same conversion, then remove this check.
    if (!isDefined(tipTapMarkdown)) {
      continue;
    }

    objectRecord[fieldName] = { markdown: tipTapMarkdown };
  }

  return objectRecord;
};
