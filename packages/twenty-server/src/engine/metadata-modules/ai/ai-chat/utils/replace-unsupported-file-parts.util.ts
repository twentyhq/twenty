import { type ExtendedUIMessage, isExtendedFileUIPart } from 'twenty-shared/ai';

import { CODE_INTERPRETER_MIME_TYPES } from 'src/engine/metadata-modules/ai/ai-chat/constants/code-interpreter-mime-types.constant';
import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-native-mime-types-for-modalities.util';

export const replaceUnsupportedFileParts = (
  messages: ExtendedUIMessage[],
  modalities: string[] = [],
  isCodeInterpreterEnabled: boolean,
): ExtendedUIMessage[] => {
  const nativeMimeTypes = getNativeMimeTypesForModalities(modalities);

  return messages.map((message) => {
    if (message.role !== 'user' || !message.parts) {
      return message;
    }

    const newParts: typeof message.parts = [];

    for (const part of message.parts) {
      if (isExtendedFileUIPart(part)) {
        const mimeType = part.mediaType ?? '';

        const isSupported =
          (isCodeInterpreterEnabled &&
            CODE_INTERPRETER_MIME_TYPES.has(mimeType)) ||
          nativeMimeTypes.has(mimeType);

        if (isSupported) {
          newParts.push(part);
        } else {
          const filename = part.filename ?? 'uploaded_file';
          newParts.push({
            type: 'text',
            text: `[Attached file: ${filename} (type: ${mimeType || 'unknown'}) — file type is not supported for direct analysis]`,
          });
        }
      } else {
        newParts.push(part);
      }
    }

    return { ...message, parts: newParts };
  });
};
