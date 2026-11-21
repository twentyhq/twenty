import { isNull } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { extractFilesFieldFileIdsFromRichTextValue } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-ids-from-rich-text-value.util';
import { type RichTextFieldWrittenDocument } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-written-document.type';

// A write that leaves the stored TipTap document alone, such as markdown only, says nothing about the files it references.
const isRewritingDocument = (richTextValue: unknown): boolean =>
  isNull(richTextValue) ||
  (isPlainObject(richTextValue) && richTextValue.tiptap !== undefined);

export const computeRichTextFieldWrittenDocuments = ({
  payload,
  richTextFields,
}: {
  payload: Record<string, unknown>;
  richTextFields: { name: string; universalIdentifier: string }[];
}): RichTextFieldWrittenDocument[] =>
  richTextFields
    .filter((richTextField) => isRewritingDocument(payload[richTextField.name]))
    .map((richTextField) => ({
      fieldName: richTextField.name,
      fieldUniversalIdentifier: richTextField.universalIdentifier,
      referencedFileIds: [
        ...extractFilesFieldFileIdsFromRichTextValue(
          payload[richTextField.name],
        ),
      ],
    }));
