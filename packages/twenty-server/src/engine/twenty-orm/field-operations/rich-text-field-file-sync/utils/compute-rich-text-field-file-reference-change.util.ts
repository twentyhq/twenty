import { isString } from '@sniptt/guards';

import { extractFilesFieldFileIdsFromRichTextValue } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-ids-from-rich-text-value.util';
import { type RichTextFieldFileReferenceChange } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-file-reference-change.type';

export const computeRichTextFieldFileReferenceChange = ({
  recordIndex,
  fieldName,
  fieldUniversalIdentifier,
  payload,
  recordBeforeWrite,
}: {
  recordIndex: number;
  fieldName: string;
  fieldUniversalIdentifier: string;
  payload: Record<string, unknown>;
  recordBeforeWrite: Record<string, unknown> | undefined;
}): RichTextFieldFileReferenceChange | undefined => {
  if (payload[fieldName] === undefined) {
    return undefined;
  }

  const fileIdsAfterWrite = extractFilesFieldFileIdsFromRichTextValue(
    payload[fieldName],
  );
  const fileIdsBeforeWrite = extractFilesFieldFileIdsFromRichTextValue(
    recordBeforeWrite?.[fieldName],
  );

  const addedFileIds = [...fileIdsAfterWrite].filter(
    (fileId) => !fileIdsBeforeWrite.has(fileId),
  );
  const removedFileIds = [...fileIdsBeforeWrite].filter(
    (fileId) => !fileIdsAfterWrite.has(fileId),
  );

  if (addedFileIds.length === 0 && removedFileIds.length === 0) {
    return undefined;
  }

  const recordId = recordBeforeWrite?.id ?? payload.id;

  return {
    recordIndex,
    recordId: isString(recordId) ? recordId : undefined,
    fieldUniversalIdentifier,
    addedFileIds,
    removedFileIds,
  };
};
