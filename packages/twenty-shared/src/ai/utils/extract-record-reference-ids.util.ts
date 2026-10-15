import { isDefined } from '@/utils/validation/isDefined';
import { isValidUuid } from '@/utils/validation/isValidUuid';

const RECORD_REFERENCE_PATTERN = /\[\[record:([^:\]]+):([^:\]]+):/g;

// Reads back the references written by formatRecordReference
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
      isValidUuid(recordId)
    ) {
      recordIds.add(recordId);
    }
  }

  return [...recordIds];
};
