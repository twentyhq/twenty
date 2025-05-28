import { CompositeFieldMetadataType, FieldMetadataType } from '@/types';

export const isCompositeFieldMetadataType = (
  type: FieldMetadataType,
): type is (typeof CompositeFieldMetadataType)[number] => {
  return CompositeFieldMetadataType.includes(
    type as (typeof CompositeFieldMetadataType)[number],
  );
};
