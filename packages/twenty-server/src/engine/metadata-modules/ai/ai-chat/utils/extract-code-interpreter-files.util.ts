import { type UIMessage } from 'ai';

// File types that should be routed to code interpreter instead of the model
const CODE_INTERPRETER_MIME_TYPES = new Set([
  // Spreadsheets
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  // Presentations
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  // Data formats
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
          // Extract this file for code interpreter
          filesForThisMessage.push({
            filename: part.filename ?? 'uploaded_file',
            url: part.url,
            mimeType,
          });
          // Don't add this part to newParts - we'll replace with text
        } else {
          // Keep image files and other supported types
          newParts.push(part);
        }
      } else {
        newParts.push(part);
      }
    }

    if (filesForThisMessage.length > 0) {
      // Add extracted files to global list
      extractedFiles.push(...filesForThisMessage);

      // Add a text part describing the available files
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

