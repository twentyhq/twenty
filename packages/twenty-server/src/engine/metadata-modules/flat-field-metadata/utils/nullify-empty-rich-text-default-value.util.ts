import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentTextDefaultValue } from './is-null-equivalent-text-default-value.util';

const nullifyEmptyTextDefaultValue = (
  textDefaultValue: string | null | undefined,
): string | null =>
  isNullEquivalentTextDefaultValue(textDefaultValue)
    ? null
    : (textDefaultValue ?? null);

export const nullifyEmptyRichTextDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): FieldMetadataDefaultValueForAnyType => {
  if (!isDefined(defaultValue)) {
    return null;
  }

  const richTextDefaultValue = defaultValue as {
    blocknote?: string | null;
    markdown?: string | null;
    tiptap?: string | null;
  };

  const blocknote = nullifyEmptyTextDefaultValue(
    richTextDefaultValue.blocknote,
  );
  const markdown = nullifyEmptyTextDefaultValue(richTextDefaultValue.markdown);
  const tiptap = nullifyEmptyTextDefaultValue(richTextDefaultValue.tiptap);

  if (blocknote === null && markdown === null && tiptap === null) {
    return null;
  }

  return { blocknote, markdown, tiptap };
};
