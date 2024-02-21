import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/metadata/field-metadata/dtos/options.input';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

type FieldMetadataOptionsMapping = {
  [FieldMetadataType.RATING]: FieldMetadataDefaultOption[];
  [FieldMetadataType.SELECT]: FieldMetadataComplexOption[];
  [FieldMetadataType.MULTI_SELECT]: FieldMetadataComplexOption[];
};

type OptionsByFieldMetadata<T extends FieldMetadataType | 'default'> =
  T extends keyof FieldMetadataOptionsMapping
    ? FieldMetadataOptionsMapping[T]
    : T extends 'default'
      ? FieldMetadataDefaultOption[] | FieldMetadataComplexOption[]
      : never;

export type FieldMetadataOptions<
  T extends FieldMetadataType | 'default' = 'default',
> = OptionsByFieldMetadata<T>;
