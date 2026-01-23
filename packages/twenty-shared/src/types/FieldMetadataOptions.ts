import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { type JsonbProperty } from '@/types/JsonbProperty.type';

export type TagColor =
  | 'green'
  | 'turquoise'
  | 'sky'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'gray';

export class FieldMetadataDefaultOption {
  id?: string;
  position: number;
  label: string;
  value: string;
}

export class FieldMetadataComplexOption extends FieldMetadataDefaultOption {
  color: TagColor;
}

type FieldMetadataOptionsMapping = {
  [FieldMetadataType.RATING]: JsonbProperty<FieldMetadataDefaultOption[]>;
  [FieldMetadataType.SELECT]: JsonbProperty<FieldMetadataComplexOption[]>;
  [FieldMetadataType.MULTI_SELECT]: JsonbProperty<FieldMetadataComplexOption[]>;
};

export type FieldMetadataOptionForAnyType =
  | null
  | FieldMetadataOptionsMapping[keyof FieldMetadataOptionsMapping];

export type FieldMetadataOptions<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? FieldMetadataOptionForAnyType
    : T extends keyof FieldMetadataOptionsMapping
      ? FieldMetadataOptionsMapping[T]
      : never | null;
