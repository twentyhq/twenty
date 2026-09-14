import {
  type FieldMetadataComplexOption,
  type FieldMetadataOptions,
} from '@/types/FieldMetadataOptions';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type TagColor } from '@/types/TagColor';

export type FieldManifestOptions<
  TFieldMetadataType extends FieldMetadataType = FieldMetadataType,
> = TFieldMetadataType extends
  | FieldMetadataType.SELECT
  | FieldMetadataType.MULTI_SELECT
  ? (Omit<FieldMetadataComplexOption, 'color'> & { color?: TagColor | null })[]
  : FieldMetadataOptions<TFieldMetadataType>;
