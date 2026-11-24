import {
  type FieldMetadataType,
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { isEmptinessOperand } from '@/utils/filter/isEmptinessOperand';
import { getFilterTypeFromFieldMetadata } from '@/utils/filter/utils/getFilterTypeFromFieldMetadata';

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

  const filterType = getFilterTypeFromFieldMetadata(
    correspondingFieldMetadataItem,
  );

  const filterHasEmptinessOperands =
    !filterTypesThatHaveNoEmptinessOperand.includes(filterType);

  return filterHasEmptinessOperands === true;
};
