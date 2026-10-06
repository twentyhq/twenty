import {
  type DashboardFilterBindingsBySlotId,
  type DashboardFilterSlot,
  type DashboardFilterValue,
  type FieldMetadataType,
} from '@/types';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { buildRecordFilterFromDashboardFilterSlot } from '@/utils/pageLayout/buildRecordFilterFromDashboardFilterSlot';
import { isDashboardFilterValueValidForSlot } from '@/utils/pageLayout/isDashboardFilterValueValidForSlot';
import { isDefined } from '@/utils/validation/isDefined';

export const buildRecordFiltersFromDashboardFilters = ({
  slots,
  values,
  bindings,
  fieldMetadataItems,
}: {
  slots: DashboardFilterSlot[];
  values: Record<string, DashboardFilterValue | undefined>;
  bindings: Partial<DashboardFilterBindingsBySlotId>;
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

      if (!isDashboardFilterValueValidForSlot({ slot, value })) {
        return undefined;
      }

      const boundFieldMetadataItem = fieldMetadataItemById.get(
        binding.fieldMetadataId,
      );

      if (!isDefined(boundFieldMetadataItem)) {
        return undefined;
      }

      return buildRecordFilterFromDashboardFilterSlot({
        slot,
        binding,
        value,
        fieldMetadataItem: boundFieldMetadataItem,
      });
    })
    .filter(isDefined);
};
