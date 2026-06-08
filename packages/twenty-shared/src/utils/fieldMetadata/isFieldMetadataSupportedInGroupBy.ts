import { FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY } from '@/constants';
import { type FieldMetadataType } from '@/types';

export const isFieldMetadataSupportedInGroupBy = ({
  type,
}: {
  type: FieldMetadataType;
}): boolean => {
  return !FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY.has(type);
};
