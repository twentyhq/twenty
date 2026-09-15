import { isObject, isString } from '@sniptt/guards';
import {
  isDefined,
  resolveInput,
  resolveRichTextVariables,
} from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

// resolveInput hands back the referenced value's own type when a string is exactly
// one variable, and a rich text markdown must stay a string for the blocknote parser.
const resolveMarkdownToString = (
  markdown: string,
  context: Record<string, unknown>,
): string => {
  const resolvedMarkdown = resolveInput(markdown, context);

  if (isString(resolvedMarkdown)) {
    return resolvedMarkdown;
  }

  if (!isDefined(resolvedMarkdown)) {
    return '';
  }

  return isObject(resolvedMarkdown)
    ? JSON.stringify(resolvedMarkdown)
    : String(resolvedMarkdown);
};

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
      richTextValue.markdown = resolveMarkdownToString(
        fieldValue.markdown,
        context,
      );
    }

    resolvedRecord[fieldName] = richTextValue;
  }

  return resolvedRecord;
};
