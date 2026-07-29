import { isToolUIPart, type UIMessage } from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';

import { AI_SDK_AZURE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

type ProviderMetadataRecord = Record<string, unknown>;

const hasEncryptedReasoningContent = (providerMetadata: unknown): boolean => {
  if (typeof providerMetadata !== 'object' || providerMetadata === null) {
    return false;
  }

  return Object.values(providerMetadata as ProviderMetadataRecord).some(
    (providerMetadataValue) => {
      if (
        typeof providerMetadataValue !== 'object' ||
        providerMetadataValue === null
      ) {
        return false;
      }

      const metadata = providerMetadataValue as ProviderMetadataRecord;

      return (
        typeof metadata.reasoningEncryptedContent === 'string' &&
        metadata.reasoningEncryptedContent.length > 0
      );
    },
  );
};

// Azure rejects a function call when its preceding reasoning item was not
// persisted with the encrypted content required for stateless replay.
export const sanitizeAzureMessagesForReplay = (
  messages: UIMessage[],
  sdkPackage: AiSdkPackage,
): UIMessage[] => {
  if (sdkPackage !== AI_SDK_AZURE) {
    return messages;
  }

  return messages.map((message) => {
    if (message.role !== 'assistant') {
      return message;
    }

    const partsToKeep = message.parts.filter((part, partIndex) => {
      if (!isToolUIPart(part)) {
        return true;
      }

      const precedingReasoningPart = [...message.parts]
        .slice(0, partIndex)
        .reverse()
        .find((precedingPart) => precedingPart.type === 'reasoning');

      if (!precedingReasoningPart) {
        return true;
      }

      return hasEncryptedReasoningContent(
        precedingReasoningPart.providerMetadata,
      );
    });

    return partsToKeep.length === message.parts.length
      ? message
      : { ...message, parts: partsToKeep };
  });
};
