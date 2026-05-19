import {
  type HydratedFilterField,
  type HydratedRecordFilter,
} from '@/utils/filter/HydratedRecordFilter';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isDefined } from '@/utils/validation/isDefined';

export type ResolveField = (id: string) => HydratedFilterField | undefined;

export const hydrateRecordFilter = (
  recordFilter: RecordFilter,
  resolveField: ResolveField,
): HydratedRecordFilter | null => {
  const field = resolveField(recordFilter.fieldMetadataId);

  if (!isDefined(field)) {
    return null;
  }

  let targetField: HydratedFilterField | undefined;

  if (isDefined(recordFilter.relationTargetFieldMetadataId)) {
    targetField = resolveField(recordFilter.relationTargetFieldMetadataId);

    if (!isDefined(targetField)) {
      return null;
    }
  }

  const {
    fieldMetadataId: _fieldMetadataId,
    relationTargetFieldMetadataId: _relationTargetFieldMetadataId,
    ...rest
  } = recordFilter;

  return { ...rest, field, targetField };
};
