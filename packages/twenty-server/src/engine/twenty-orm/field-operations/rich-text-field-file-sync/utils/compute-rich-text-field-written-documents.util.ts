import { extractFilesFieldFileIdsFromRichTextValue } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-ids-from-rich-text-value.util';
import { type RichTextFieldWrittenDocument } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-written-document.type';
import { isRewritingRichTextDocument } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/is-rewriting-rich-text-document.util';

export const computeRichTextFieldWrittenDocuments = ({
  payload,
  recordBeforeWrite,
  richTextFields,
}: {
  payload: Record<string, unknown>;
  recordBeforeWrite: Record<string, unknown> | undefined;
  richTextFields: { name: string; universalIdentifier: string }[];
}): RichTextFieldWrittenDocument[] =>
  richTextFields
    .filter((richTextField) =>
      isRewritingRichTextDocument(payload[richTextField.name]),
    )
    .map((richTextField) => {
      const fileIdsAfterWrite = extractFilesFieldFileIdsFromRichTextValue(
        payload[richTextField.name],
      );
      const fileIdsBeforeWrite = extractFilesFieldFileIdsFromRichTextValue(
        recordBeforeWrite?.[richTextField.name],
      );

      return {
        fieldName: richTextField.name,
        fieldUniversalIdentifier: richTextField.universalIdentifier,
        referencedFileIds: [...fileIdsAfterWrite],
        addedFileIds: [...fileIdsAfterWrite].filter(
          (fileId) => !fileIdsBeforeWrite.has(fileId),
        ),
        removedFileIds: [...fileIdsBeforeWrite].filter(
          (fileId) => !fileIdsAfterWrite.has(fileId),
        ),
      };
    })
    .filter(
      ({ referencedFileIds, removedFileIds }) =>
        referencedFileIds.length > 0 || removedFileIds.length > 0,
    );
