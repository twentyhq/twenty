import { isString } from '@sniptt/guards';
import { richTextValueSchema } from 'twenty-shared/types';
import {
  resolveRichTextVariables,
  resolveStringTemplate,
} from 'twenty-shared/utils';

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

    const { blocknote, markdown } = parsedRichTextValue.data;

    resolvedRecord[fieldName] = {
      blocknote: isString(blocknote)
        ? resolveRichTextVariables(blocknote, context)
        : blocknote,
      markdown: isString(markdown)
        ? resolveStringTemplate(markdown, context)
        : markdown,
    };
  }

  return resolvedRecord;
};
