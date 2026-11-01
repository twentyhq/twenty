import { isNonEmptyString } from '@sniptt/guards';
import {
  type RichTextMetadata,
  richTextValueSchema,
} from 'twenty-shared/types';
import {
  convertTipTapBlocksToMarkdown,
  isDefined,
  parseTipTapJsonDocument,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

const convertStepRichTextValueToMarkdown = ({
  tiptap,
  blocknote,
}: RichTextMetadata): string | undefined => {
  const tipTapDocument = isNonEmptyString(tiptap)
    ? parseTipTapJsonDocument(tiptap)
    : undefined;

  if (isDefined(tipTapDocument)) {
    return tipTapDocumentToMarkdown(tipTapDocument);
  }

  return isDefined(blocknote)
    ? convertTipTapBlocksToMarkdown(blocknote)
    : undefined;
};

export const convertStepObjectRecordTipTapToMarkdown = (
  stepObjectRecord: Record<string, unknown>,
  objectMetadataInfo: Pick<
    ObjectMetadataInfo,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  >,
): Record<string, unknown> => {
  const objectRecord = { ...stepObjectRecord };

  for (const fieldName of findRichTextFieldNames(objectMetadataInfo)) {
    const parsedStepValue = richTextValueSchema.safeParse(
      stepObjectRecord[fieldName],
    );

    const tipTapMarkdown = parsedStepValue.success
      ? convertStepRichTextValueToMarkdown(parsedStepValue.data)
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
