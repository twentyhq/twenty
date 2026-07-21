import { type ExtendedUIMessage, isExtendedFileUIPart } from 'twenty-shared/ai';

import { CODE_INTERPRETER_MIME_TYPES } from 'src/engine/metadata-modules/ai/ai-chat/constants/code-interpreter-mime-types.constant';
import { type ExtractCodeInterpreterFilesResult } from 'src/engine/metadata-modules/ai/ai-chat/types/extract-code-interpreter-files-result.type';
import { type ExtractedFile } from 'src/engine/metadata-modules/ai/ai-chat/types/extracted-file.type';

export const extractCodeInterpreterFiles = (
  messages: ExtendedUIMessage[],
): ExtractCodeInterpreterFilesResult => {
  const extractedFiles: ExtractedFile[] = [];

  const processedMessages = messages.map((message) => {
    if (message.role !== 'user' || !message.parts) {
      return message;
    }

    const newParts: typeof message.parts = [];
    const filesForThisMessage: ExtractedFile[] = [];

    for (const part of message.parts) {
      if (isExtendedFileUIPart(part)) {
        const mimeType = part.mediaType ?? '';

        if (CODE_INTERPRETER_MIME_TYPES.has(mimeType)) {
          filesForThisMessage.push({
            filename: part.filename ?? 'uploaded_file',
            fileId: part.fileId,
            mimeType,
          });
        } else {
          newParts.push(part);
        }
      } else {
        newParts.push(part);
      }
    }

    if (filesForThisMessage.length > 0) {
      extractedFiles.push(...filesForThisMessage);

      const fileList = filesForThisMessage
        .map((f) => `- ${f.filename} (${f.mimeType})`)
        .join('\n');

      newParts.push({
        type: 'text',
        text: `\n\n[Files available for code interpreter at /home/user/:\n${fileList}]\n\nUse the code_interpreter tool to analyze these files.`,
      });
    }

    return {
      ...message,
      parts: newParts,
    };
  });

  return {
    processedMessages,
    extractedFiles,
  };
};
