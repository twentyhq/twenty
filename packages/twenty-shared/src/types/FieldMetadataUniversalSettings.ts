import { type FieldMetadataSettings } from '@/types/FieldMetadataSettings';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type FormatRecordSerializedRelationProperties } from '@/types/FormatRecordSerializedRelationProperties';

export type FieldMetadataUniversalSettings<
  T extends FieldMetadataType = FieldMetadataType,
> = FormatRecordSerializedRelationProperties<FieldMetadataSettings<T>>;
