import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
  type FieldMetadataType,
} from '@/types';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { getDashboardFilterSlotRecordFilterId } from '@/utils/pageLayout/getDashboardFilterSlotRecordFilterId';

// The filter type comes from the bound field, which every chart may bind differently, not from the slot.
export const buildRecordFilterFromDashboardFilterSlot = ({
  slot,
  binding,
  value,
  fieldMetadataItem,
}: {
  slot: DashboardFilterSlot;
  binding: DashboardFilterBinding;
  value: DashboardFilterValue;
  fieldMetadataItem: { id: string; type: FieldMetadataType };
}): RecordFilter => ({
  id: getDashboardFilterSlotRecordFilterId(slot.id),
  fieldMetadataId: fieldMetadataItem.id,
  type: getFilterTypeFromFieldType(fieldMetadataItem.type),
  operand: value.operand,
  value: value.value,
  subFieldName: binding.subFieldName,
  relationTargetFieldMetadataId: binding.relationTargetFieldMetadataId,
});
