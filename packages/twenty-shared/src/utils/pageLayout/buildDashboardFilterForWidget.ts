import {
  type DashboardFilterBinding,
  type FieldMetadataType,
  type PageLayoutFilterCondition,
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '@/types';
import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { stringifyRelativeDateFilter } from '@/utils/filter/dates/utils/stringifyRelativeDateFilter';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { plainDateFilterValueSchema } from '@/utils/filter/utils/validation-schemas/filterValueScalarSchemas';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isDefined } from '@/utils/validation/isDefined';

const convertConditionValueToBoundFieldFormat = ({
  condition: { operand, value },
  fieldType,
  timeZone,
}: {
  condition: PageLayoutFilterCondition;
  fieldType: FieldMetadataType;
  timeZone: string;
}): string => {
  if (operand === ViewFilterOperand.IS_RELATIVE) {
    const relativeDateFilter =
      relativeDateFilterStringifiedSchema.safeParse(value);

    return relativeDateFilter.success
      ? stringifyRelativeDateFilter({
          ...relativeDateFilter.data,
          timezone: timeZone,
        })
      : value;
  }

  const isDateTimeBoundary =
    getFilterTypeFromFieldType(fieldType) === 'DATE_TIME' &&
    (operand === ViewFilterOperand.IS_AFTER ||
      operand === ViewFilterOperand.IS_BEFORE);

  if (!isDateTimeBoundary) {
    return value;
  }

  const plainDate = plainDateFilterValueSchema.safeParse(value);

  return plainDate.success
    ? plainDate.data.toZonedDateTime(timeZone).toInstant().toString()
    : value;
};

// Values are in the DATE field format. Convert the result to a gql filter with
// the same timeZone: IS on a DATE_TIME field and IS_TODAY resolve days in it.
export const buildDashboardFilterForWidget = ({
  values,
  bindings,
  fields,
  timeZone,
}: {
  values: Record<string, PageLayoutFilterValue>;
  bindings: DashboardFilterBinding[] | null | undefined;
  fields: { id: string; type: FieldMetadataType }[];
  timeZone: string;
}): { recordFilters: Omit<RecordFilter, 'id'>[] } => {
  const fieldTypeById = new Map(fields.map(({ id, type }) => [id, type]));

  const recordFilters = (bindings ?? []).flatMap<Omit<RecordFilter, 'id'>>(
    ({ pageLayoutFilterId, fieldMetadataId }) => {
      const value = values[pageLayoutFilterId];
      const fieldType = fieldTypeById.get(fieldMetadataId);

      if (!isDefined(value) || !isDefined(fieldType)) {
        return [];
      }

      return value.conditions.map((condition) => ({
        fieldMetadataId,
        operand: condition.operand,
        value: convertConditionValueToBoundFieldFormat({
          condition,
          fieldType,
          timeZone,
        }),
      }));
    },
  );

  return { recordFilters };
};
