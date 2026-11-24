import {
  type FieldMetadataType,
  type FilterableAndTSVectorFieldType,
} from '@/types';
import { getFieldMetadataValueType } from '@/utils/fieldMetadata/getFieldMetadataValueType';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';

export const getFilterTypeFromFieldMetadata = (fieldMetadata: {
  type: FieldMetadataType;
  settings?: object | null;
}): FilterableAndTSVectorFieldType =>
  getFilterTypeFromFieldType(getFieldMetadataValueType(fieldMetadata));
