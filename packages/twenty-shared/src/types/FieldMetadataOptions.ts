import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { type TagColor } from '@/types/TagColor';

export class FieldMetadataDefaultOption {
  id?: string;
  position: number;
  label: string;
  value: string;
  // Only stored when false: an inactive option stays on records but can no longer be picked.
  isActive?: boolean;
  // Read-only: set when the option is owned by another application than its field. Never stored.
  applicationId?: string;
}

export class FieldMetadataComplexOption extends FieldMetadataDefaultOption {
  color: TagColor;
}

type FieldMetadataOptionsMapping = {
  [FieldMetadataType.RATING]: FieldMetadataDefaultOption[];
  [FieldMetadataType.SELECT]: FieldMetadataComplexOption[];
  [FieldMetadataType.MULTI_SELECT]: FieldMetadataComplexOption[];
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
