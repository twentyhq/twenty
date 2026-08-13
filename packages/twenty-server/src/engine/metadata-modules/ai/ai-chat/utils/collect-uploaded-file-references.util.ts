import { type ExtendedUIMessage, isExtendedFileUIPart } from 'twenty-shared/ai';

import { type UploadedFileReference } from 'src/engine/metadata-modules/ai/ai-chat/types/uploaded-file-reference.type';

export const collectUploadedFileReferences = (
  messages: ExtendedUIMessage[],
): UploadedFileReference[] => {
  const referencesByFileId = new Map<string, UploadedFileReference>();

  for (const message of messages) {
    if (message.role !== 'user' || !message.parts) {
      continue;
    }

    for (const part of message.parts) {
      if (isExtendedFileUIPart(part)) {
        referencesByFileId.set(part.fileId, {
          filename: part.filename ?? 'uploaded_file',
          fileId: part.fileId,
        });
      }
    }
  }

  return [...referencesByFileId.values()];
};
