import { FieldMetadataType } from '@/types/FieldMetadataType';
import { isDefined } from '@/utils';

export const UNKNOWN_STEP_FILTER_TYPE = 'unknown';

// A filter on a field compares as that field's type; other variables as their output schema declares them
export const computeStepFilterType = ({
  fieldMetadataType,
  variableType,
}: {
  fieldMetadataType?: FieldMetadataType;
  variableType?: string;
}): string => {
  if (isDefined(fieldMetadataType)) {
    return fieldMetadataType === FieldMetadataType.MORPH_RELATION
      ? FieldMetadataType.RELATION
      : fieldMetadataType;
  }

  return variableType ?? UNKNOWN_STEP_FILTER_TYPE;
};
