import { AggregateOperations } from '@/types/AggregateOperations';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type RollupAggregateOperation } from '@/types/RollupAggregateOperation';
import { type RollupResultFieldMetadataType } from '@/types/RollupResultFieldMetadataType';
import { type FieldMetadataValueType } from '@/utils/fieldMetadata/getFieldMetadataValueType';
import { isDefined } from '@/utils/validation/isDefined';

export const computeRollupResultType = ({
  aggregateOperation,
  aggregatedFieldValueType,
}: {
  aggregateOperation: RollupAggregateOperation;
  aggregatedFieldValueType: FieldMetadataValueType | null;
}): RollupResultFieldMetadataType | null => {
  if (aggregateOperation === AggregateOperations.COUNT) {
    return isDefined(aggregatedFieldValueType)
      ? null
      : FieldMetadataType.NUMBER;
  }

  if (aggregatedFieldValueType === FieldMetadataType.NUMBER) {
    return FieldMetadataType.NUMBER;
  }

  const isMinOrMax =
    aggregateOperation === AggregateOperations.MIN ||
    aggregateOperation === AggregateOperations.MAX;

  if (
    isMinOrMax &&
    (aggregatedFieldValueType === FieldMetadataType.DATE ||
      aggregatedFieldValueType === FieldMetadataType.DATE_TIME)
  ) {
    return aggregatedFieldValueType;
  }

  return null;
};
