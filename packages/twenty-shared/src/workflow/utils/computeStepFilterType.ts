import { FieldMetadataType } from '@/types/FieldMetadataType';
import { isDefined } from '@/utils';

export const UNKNOWN_STEP_FILTER_TYPE = 'unknown';

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
