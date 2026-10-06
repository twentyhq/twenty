import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
  type FieldMetadataType,
} from '@/types';
import { isRecordFilterValueValid } from '@/utils/filter/isRecordFilterValueValid';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { isDefined } from '@/utils/validation/isDefined';

export const getDashboardFilterRecordFilterId = (slotId: string) =>
  `dashboard-filter-${slotId}`;

export const buildRecordFiltersFromDashboardFilters = ({
  slots,
  values,
  bindings,
  fieldMetadataItems,
}: {
  slots: DashboardFilterSlot[];
  values: Record<string, DashboardFilterValue | undefined>;
  bindings: Record<string, DashboardFilterBinding | null | undefined>;
  fieldMetadataItems: { id: string; type: FieldMetadataType }[];
}): RecordFilter[] => {
  const fieldMetadataItemById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  return slots
    .map((slot): RecordFilter | undefined => {
      const value = values[slot.id];
      const binding = bindings[slot.id];

      if (!isDefined(value) || !isDefined(binding)) {
        return undefined;
      }

      if (!isRecordFilterValueValid(value)) {
        return undefined;
      }

      const boundFieldMetadataItem = fieldMetadataItemById.get(
        binding.fieldMetadataId,
      );

      if (!isDefined(boundFieldMetadataItem)) {
        return undefined;
      }

      return {
        id: getDashboardFilterRecordFilterId(slot.id),
        fieldMetadataId: binding.fieldMetadataId,
        type: getFilterTypeFromFieldType(boundFieldMetadataItem.type),
        operand: value.operand,
        value: value.value,
        subFieldName: binding.subFieldName ?? undefined,
        relationTargetFieldMetadataId:
          binding.relationTargetFieldMetadataId ?? undefined,
      };
    })
    .filter(isDefined);
};
