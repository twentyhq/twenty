import { type UIMessage } from 'ai';

const CODE_INTERPRETER_MIME_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'text/plain',
  'text/xml',
  'application/xml',
]);

export type ExtractedFile = {
  filename: string;
  url: string;
  mimeType: string;
};

export type ExtractCodeInterpreterFilesResult = {
  processedMessages: UIMessage[];
  extractedFiles: ExtractedFile[];
};

export const extractCodeInterpreterFiles = (
  messages: UIMessage[],
): ExtractCodeInterpreterFilesResult => {
  const extractedFiles: ExtractedFile[] = [];

  const processedMessages = messages.map((message) => {
    if (message.role !== 'user' || !message.parts) {
      return message;
    }

    const newParts: typeof message.parts = [];
    const filesForThisMessage: ExtractedFile[] = [];

    for (const part of message.parts) {
      if (part.type === 'file') {
        const mimeType = part.mediaType ?? '';

        if (CODE_INTERPRETER_MIME_TYPES.has(mimeType)) {
          filesForThisMessage.push({
            filename: part.filename ?? 'uploaded_file',
            url: part.url,
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
