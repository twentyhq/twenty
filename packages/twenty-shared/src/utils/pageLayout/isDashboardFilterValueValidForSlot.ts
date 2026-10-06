import { type DashboardFilterSlot, type DashboardFilterValue } from '@/types';
import { isRecordFilterValueValid } from '@/utils/filter/isRecordFilterValueValid';
import { getFilterOperandsForFilterableFieldType } from '@/utils/filter/utils/getFilterOperandsForFilterableFieldType';
import { getFilterValueSchema } from '@/utils/filter/utils/validation-schemas/getFilterValueSchema';
import { jsonRelationFilterValueSchema } from '@/utils/filter/utils/validation-schemas/jsonRelationFilterValueSchema';
import { isDefined } from '@/utils/validation/isDefined';

// A dashboard has no current record, so the server would silently drop such a filter while the chip shows a value.
const isRelationValueBoundToCurrentRecord = (value: string) =>
  jsonRelationFilterValueSchema.safeParse(value).data
    ?.isCurrentRecordSelected === true;

// Values can come from a hand-edited URL, so they are checked against the slot type before reaching the filter engine.
export const isDashboardFilterValueValidForSlot = ({
  slot,
  value,
}: {
  slot: DashboardFilterSlot;
  value: DashboardFilterValue;
}): boolean => {
  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType: slot.filterType,
  });

  if (!allowedOperands.includes(value.operand)) {
    return false;
  }

  if (!isRecordFilterValueValid(value)) {
    return false;
  }

  if (
    slot.filterType === 'RELATION' &&
    isRelationValueBoundToCurrentRecord(value.value)
  ) {
    return false;
  }

  const valueSchema = getFilterValueSchema({
    filterType: slot.filterType,
    operand: value.operand,
  });

  return !isDefined(valueSchema) || valueSchema.safeParse(value.value).success;
};
