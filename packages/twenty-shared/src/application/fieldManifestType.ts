import {
  type FieldMetadataType,
  type FieldMetadataSettings,
  type FieldMetadataOptions,
  type FieldMetadataDefaultValue,
} from '@/types';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type FieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    FieldMetadataType.RELATION
  >,
> = SyncableEntityOptions & {
  type: T;
  label: string;
  description?: string;
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  settings?: FieldMetadataSettings<T>;
  isNullable?: boolean;
};
