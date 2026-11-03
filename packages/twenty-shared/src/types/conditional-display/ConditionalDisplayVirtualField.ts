import { type FieldMetadataType } from '../FieldMetadataType';

export type ConditionalDisplayVirtualField = {
  type: FieldMetadataType;
  options?: readonly string[];
};
