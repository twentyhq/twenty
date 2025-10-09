import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type PartialFieldMetadataItemOption } from '@/types/PartialFieldMetadataOption';

export type PartialFieldMetadataItem = {
  id: string;
  name: string;
  type: FieldMetadataType;
  label: string;
  options?: PartialFieldMetadataItemOption[] | null;
};
