import { FieldMetadataType, IsExactly } from 'twenty-shared';

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
    ? FieldMetadataDefaultOption[] | FieldMetadataComplexOption[]
    : T extends keyof FieldMetadataOptionsMapping
      ? FieldMetadataOptionsMapping[T]
      : never;
