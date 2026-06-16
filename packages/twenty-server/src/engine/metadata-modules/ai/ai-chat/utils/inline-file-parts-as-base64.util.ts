import { type UIMessage } from 'ai';
import { isExtendedFileUIPart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

type FileContent = {
  buffer: Buffer;
  mimeType: string;
};

type LoadFileContent = (fileId: string) => Promise<FileContent | null>;

export const inlineFilePartsAsBase64 = async (
  messages: UIMessage[],
  loadFileContent: LoadFileContent,
): Promise<UIMessage[]> => {
  return Promise.all(
    messages.map(async (message) => {
      const inlinedParts = await Promise.all(
        message.parts.map(async (part) => {
          if (!isExtendedFileUIPart(part)) {
            return part;
          }

          if (part.url.startsWith('data:')) {
            return part;
          }

          const content = await loadFileContent(part.fileId);

          if (!isDefined(content)) {
            return {
              type: 'text' as const,
              text: `[Attachment${
                part.filename ? ` "${part.filename}"` : ''
              } could not be loaded and is unavailable.]`,
            };
          }

          return {
            ...part,
            mediaType: content.mimeType,
            url: `data:${content.mimeType};base64,${content.buffer.toString(
              'base64',
            )}`,
          };
        }),
      );

      return {
        ...message,
        parts: inlinedParts,
      };
    }),
  );
};
