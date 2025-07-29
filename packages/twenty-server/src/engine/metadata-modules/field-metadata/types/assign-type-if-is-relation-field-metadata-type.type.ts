import { FieldMetadataType, IsExactly } from 'twenty-shared/types';

export type AssignTypeIfIsRelationFieldMetadataType<
  Ttype,
  T extends FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? null | Ttype // Could be improved to be | unknown
    : T extends FieldMetadataType.RELATION
      ? Ttype
      : T extends FieldMetadataType.MORPH_RELATION
        ? Ttype
        : never | null;
