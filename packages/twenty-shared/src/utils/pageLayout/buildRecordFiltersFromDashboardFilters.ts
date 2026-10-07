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

type BuildRecordFiltersFromDashboardFiltersArgs = {
  slots: DashboardFilterSlot[];
  values: Record<string, DashboardFilterValue | undefined>;
  bindings: Record<string, DashboardFilterBinding | null> | undefined;
  fieldMetadataItems: { id: string; type: FieldMetadataType }[];
};

export const getDashboardFilterRecordFilterId = (slotId: string) =>
  `dashboard-filter-${slotId}`;

// Filters stay ungrouped so computeRecordGqlOperationFilter ANDs them at the root with the widget's own filters.
export const buildRecordFiltersFromDashboardFilters = ({
  slots,
  values,
  bindings,
  fieldMetadataItems,
}: BuildRecordFiltersFromDashboardFiltersArgs): RecordFilter[] => {
  if (!isDefined(bindings)) {
    return [];
  }

  const fieldMetadataItemById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  return slots.flatMap((slot) => {
    const value = values[slot.id];
    const binding = bindings[slot.id];

    if (!isDefined(value) || !isDefined(binding)) {
      return [];
    }

    // Valueless operands (IS_TODAY, IS_EMPTY, ...) are legitimately empty-valued.
    if (!isRecordFilterValueValid(value)) {
      return [];
    }

    const boundFieldMetadataItem = fieldMetadataItemById.get(
      binding.fieldMetadataId,
    );

    if (!isDefined(boundFieldMetadataItem)) {
      return [];
    }

    return [
      {
        id: getDashboardFilterRecordFilterId(slot.id),
        fieldMetadataId: binding.fieldMetadataId,
        type: getFilterTypeFromFieldType(boundFieldMetadataItem.type),
        operand: value.operand,
        value: value.value,
        subFieldName: binding.subFieldName,
        relationTargetFieldMetadataId:
          binding.relationTargetFieldMetadataId ?? null,
      },
    ];
  });
};
