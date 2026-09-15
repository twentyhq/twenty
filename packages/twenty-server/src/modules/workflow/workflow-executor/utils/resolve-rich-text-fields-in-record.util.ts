import { isObject, isString } from '@sniptt/guards';
import {
  resolveRichTextVariables,
  resolveStringTemplate,
} from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

// A rich text value is text, so its variables are substituted as text here, before
// the generic resolver runs and would hand a whole-string variable back in its own type.
export const resolveRichTextFieldsInRecord = (
  objectRecord: Record<string, unknown>,
  objectMetadataInfo: ObjectMetadataInfo,
  context: Record<string, unknown>,
): Record<string, unknown> => {
  const richTextFieldNames = findRichTextFieldNames(objectMetadataInfo);

  const resolvedRecord = { ...objectRecord };

  for (const fieldName of richTextFieldNames) {
    const fieldValue = resolvedRecord[fieldName];

    if (!isObject(fieldValue)) {
      continue;
    }

    const richTextValue: Record<string, unknown> = { ...fieldValue };

    if ('blocknote' in fieldValue && isString(fieldValue.blocknote)) {
      richTextValue.blocknote = resolveRichTextVariables(
        fieldValue.blocknote,
        context,
      );
    }

    if ('markdown' in fieldValue && isString(fieldValue.markdown)) {
      richTextValue.markdown = resolveStringTemplate(
        fieldValue.markdown,
        context,
      );
    }

    resolvedRecord[fieldName] = richTextValue;
  }

  return resolvedRecord;
};
