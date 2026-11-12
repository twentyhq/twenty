import {
  FieldActorSource,
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { getFilterValueSchema } from '@/utils/filter/utils/validation-schemas/getFilterValueSchema';
import { isDefined } from '@/utils/validation/isDefined';

const SINGLE_VALUE_SAMPLE = 'value';
const ARRAY_VALUE_SAMPLES = [
  JSON.stringify(['value']),
  JSON.stringify(['00000000-0000-4000-8000-000000000000']),
  JSON.stringify([FieldActorSource.MANUAL]),
];

export const isFilterValueExpectedAsArray = ({
  filterType,
  operand,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  operand: ViewFilterOperand;
  subFieldName?: string | null | undefined;
}): boolean => {
  const valueSchema = getFilterValueSchema({
    filterType,
    operand,
    subFieldName,
  });

  return (
    isDefined(valueSchema) &&
    !valueSchema.safeParse(SINGLE_VALUE_SAMPLE).success &&
    ARRAY_VALUE_SAMPLES.some(
      (arrayValueSample) => valueSchema.safeParse(arrayValueSample).success,
    )
  );
};
