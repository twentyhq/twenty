import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';

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
