import { ROLLUP_RESULT_FIELD_METADATA_TYPES } from '@/constants/RollupResultFieldMetadataTypes';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type RollupResultFieldMetadataType } from '@/types/RollupResultFieldMetadataType';
import { isDefined } from '@/utils/validation/isDefined';

export type FieldMetadataValueType = Exclude<
  FieldMetadataType,
  FieldMetadataType.ROLLUP
>;

const isRollupResultFieldMetadataType = (
  value: unknown,
): value is RollupResultFieldMetadataType =>
  ROLLUP_RESULT_FIELD_METADATA_TYPES.some((resultType) => resultType === value);

export const getFieldMetadataValueType = ({
  type,
  settings,
}: {
  type: FieldMetadataType;
  settings?: object | null;
}): FieldMetadataValueType => {
  if (type !== FieldMetadataType.ROLLUP) {
    return type;
  }

  if (!isDefined(settings) || !('resultType' in settings)) {
    return FieldMetadataType.NUMBER;
  }

  if (!isRollupResultFieldMetadataType(settings.resultType)) {
    return FieldMetadataType.NUMBER;
  }

  return settings.resultType;
};
