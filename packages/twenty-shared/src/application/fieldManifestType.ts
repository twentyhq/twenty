import { type FieldMetadataType } from '@/types';

export type FieldManifest = {
  universalIdentifier: string;
  type: FieldMetadataType;
  label: string;
  description?: string;
  icon?: string;
  defaultValue?: any;
  options?: any;
  settings?: any;
  isNullable?: boolean;
  isFieldUiReadOnly?: boolean;
};
