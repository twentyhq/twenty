import { isNull } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

// A write that leaves the stored TipTap document alone, such as markdown only, says nothing about the files it references.
export const isRewritingRichTextDocument = (richTextValue: unknown): boolean =>
  isNull(richTextValue) ||
  (isPlainObject(richTextValue) && richTextValue.tiptap !== undefined);
