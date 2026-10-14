import { isDefined, type RecordFilter } from 'twenty-shared/utils';

export const findRecordFilterWithMissingField = ({
  recordFilters,
  existingFieldMetadataIds,
}: {
  recordFilters: Pick<
    RecordFilter,
    'fieldMetadataId' | 'relationTargetFieldMetadataId'
  >[];
  existingFieldMetadataIds: Set<string>;
}) =>
  recordFilters.find(
    (recordFilter) =>
      !existingFieldMetadataIds.has(recordFilter.fieldMetadataId) ||
      (isDefined(recordFilter.relationTargetFieldMetadataId) &&
        !existingFieldMetadataIds.has(
          recordFilter.relationTargetFieldMetadataId,
        )),
  );
