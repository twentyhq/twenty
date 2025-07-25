import { FieldMetadataType, IsExactly } from 'twenty-shared/types';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

type FieldMetadataOptionsMapping = {
  [FieldMetadataType.RATING]: FieldMetadataDefaultOption[];
  [FieldMetadataType.SELECT]: FieldMetadataComplexOption[];
  [FieldMetadataType.MULTI_SELECT]: FieldMetadataComplexOption[];
};

export type FieldMetadataOptions<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? null | (FieldMetadataDefaultOption[] | FieldMetadataComplexOption[]) // Could be improved to be | unknown
    : T extends keyof FieldMetadataOptionsMapping
      ? FieldMetadataOptionsMapping[T]
      : never | null;
