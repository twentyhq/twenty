import {
  type FieldMetadataType,
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { isEmptinessOperand } from '@/utils/filter/isEmptinessOperand';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';

export const checkIfShouldComputeEmptinessFilter = ({
  recordFilterOperand,
  correspondingFieldMetadataItem,
}: {
  recordFilterOperand: ViewFilterOperand;
  correspondingFieldMetadataItem: { type: FieldMetadataType };
}) => {
  const isAnEmptinessOperand = isEmptinessOperand(recordFilterOperand);

  if (!isAnEmptinessOperand) {
    return false;
  }

  const filterTypesThatHaveNoEmptinessOperand: FilterableAndTSVectorFieldType[] =
    ['BOOLEAN', 'TS_VECTOR'];

  const filterType = getFilterTypeFromFieldType(
    correspondingFieldMetadataItem.type,
  );

  const filterHasEmptinessOperands =
    !filterTypesThatHaveNoEmptinessOperand.includes(filterType);

  return filterHasEmptinessOperands === true;
};
