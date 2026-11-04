import { CHAT_REFERENCE_BODY_PATTERN } from '@/ai/constants/chat-reference-body-pattern.const';
import { CHAT_REFERENCE_UUID_REGEX } from '@/ai/constants/chat-reference-uuid-regex.const';
import { isDefined } from '@/utils/validation/isDefined';

const RECORD_REFERENCE_PATTERN = new RegExp(
  `\\[\\[(${CHAT_REFERENCE_BODY_PATTERN})\\]\\]`,
  'g',
);

// Reads back the references written by formatRecordReference
export const extractRecordReferenceIds = ({
  text,
  objectNameSingular,
}: {
  text: string;
  objectNameSingular: string;
}): string[] => {
  const recordIds = new Set<string>();

  for (const [, body = ''] of text.matchAll(RECORD_REFERENCE_PATTERN)) {
    const [kind, referenceObjectName, recordId, ...labelSegments] =
      body.split(':');

    if (
      kind === 'record' &&
      referenceObjectName === objectNameSingular &&
      isDefined(recordId) &&
      CHAT_REFERENCE_UUID_REGEX.test(recordId) &&
      labelSegments.length > 0
    ) {
      recordIds.add(recordId);
    }
  }

  return [...recordIds];
};
