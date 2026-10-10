import { isString } from '@sniptt/guards';
import { isPlainObject, resolveStringTemplate } from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

// resolveInput would turn a markdown that is exactly one variable into a number or an object
export const resolveRichTextMarkdownVariables = (
  objectRecord: Record<string, unknown>,
  objectMetadataInfo: Pick<
    ObjectMetadataInfo,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  >,
  context: Record<string, unknown>,
): Record<string, unknown> => {
  const resolvedRecord = { ...objectRecord };

  for (const fieldName of findRichTextFieldNames(objectMetadataInfo)) {
    const richTextValue = resolvedRecord[fieldName];

    if (!isPlainObject(richTextValue) || !isString(richTextValue.markdown)) {
      continue;
    }

    resolvedRecord[fieldName] = {
      ...richTextValue,
      markdown: resolveStringTemplate(richTextValue.markdown, context),
    };
  }

  return resolvedRecord;
};
