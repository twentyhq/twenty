import { CHAT_REFERENCE_UUID_REGEX } from '@/ai/constants/chat-reference-uuid-regex.const';
import { isDefined } from '@/utils/validation/isDefined';

const RECORD_REFERENCE_PATTERN = /\[\[(?:record:)?([^:[\]]+):([^:[\]]+):/g;

export const extractRecordReferenceIds = ({
  text,
  objectNameSingular,
}: {
  text: string;
  objectNameSingular: string;
}): string[] => {
  const recordIds = new Set<string>();

  for (const [, referenceObjectName, recordId] of text.matchAll(
    RECORD_REFERENCE_PATTERN,
  )) {
    if (
      referenceObjectName === objectNameSingular &&
      isDefined(recordId) &&
      CHAT_REFERENCE_UUID_REGEX.test(recordId)
    ) {
      recordIds.add(recordId);
    }
  }

  return [...recordIds];
};
