import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type FieldMetadataSettings } from '@/types/FieldMetadataSettings';
import { type FormatRecordSerializedRelationProperties } from '@/types/FormatRecordSerializedRelationProperties.type';

export type FieldMetadataUniversalSettings<
  T extends FieldMetadataType = FieldMetadataType,
> = FormatRecordSerializedRelationProperties<FieldMetadataSettings<T>>;
