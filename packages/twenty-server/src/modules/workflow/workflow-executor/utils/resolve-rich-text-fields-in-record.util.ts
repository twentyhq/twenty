import { isString } from 'class-validator';
import { isDefined, resolveRichTextVariables } from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

export const resolveRichTextFieldsInRecord = (
  objectRecord: Record<string, unknown>,
  objectMetadataInfo: ObjectMetadataInfo,
  context: Record<string, unknown>,
): Record<string, unknown> => {
  const richTextFieldNames = findRichTextFieldNames(objectMetadataInfo);

  const resolvedRecord = { ...objectRecord };

  for (const fieldName of richTextFieldNames) {
    const fieldValue = resolvedRecord[fieldName];

    if (
      isDefined(fieldValue) &&
      'blocknote' in fieldValue &&
      isString(fieldValue.blocknote)
    ) {
      const richTextValue = fieldValue as { blocknote: string };

      resolvedRecord[fieldName] = {
        ...richTextValue,
        blocknote: resolveRichTextVariables(richTextValue.blocknote, context),
      };
    }
  }

  return resolvedRecord;
};
