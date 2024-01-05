import {
  FieldMetadataComplexOptions,
  FieldMetadataDefaultOptions,
} from 'src/metadata/field-metadata/dtos/options.input';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

type FieldMetadataOptionsMapping = {
  [FieldMetadataType.RATING]: FieldMetadataDefaultOptions[];
  [FieldMetadataType.SELECT]: FieldMetadataComplexOptions[];
  [FieldMetadataType.MULTI_SELECT]: FieldMetadataComplexOptions[];
};

type OptionsByFieldMetadata<T extends FieldMetadataType | 'default'> =
  T extends keyof FieldMetadataOptionsMapping
    ? FieldMetadataOptionsMapping[T]
    : T extends 'default'
      ? FieldMetadataDefaultOptions[] | FieldMetadataComplexOptions[]
      : never;

export type FieldMetadataOptions<
  T extends FieldMetadataType | 'default' = 'default',
> = OptionsByFieldMetadata<T>;
