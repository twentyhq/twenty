import { type FieldMetadataType } from '@/types/FieldMetadataType';

export type RecordExportColumn = {
  fieldName: string;
  label: string;
  type: FieldMetadataType;
  subFieldName?: string;
};
