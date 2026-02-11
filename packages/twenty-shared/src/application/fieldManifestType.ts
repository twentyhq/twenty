import {
  type FieldMetadataType,
  type FieldMetadataOptions,
  type FieldMetadataDefaultValue,
  type FieldMetadataUniversalSettings,
} from '@/types';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type RegularFieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    FieldMetadataType.RELATION
  >,
> = SyncableEntityOptions & {
  type: T;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  universalSettings?: FieldMetadataUniversalSettings<T>;
  isNullable?: boolean;
  objectUniversalIdentifier: string;
};

// Both sides of a relation must be declared explicitly in the manifest.
// Relation-specific settings (relationType, onDelete, joinColumnName)
// are provided through the `settings` field.
export type RelationFieldManifest =
  RegularFieldManifest<FieldMetadataType.RELATION> & {
    relationTargetFieldMetadataUniversalIdentifier: string;
    relationTargetObjectMetadataUniversalIdentifier: string;
  };

export type FieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    FieldMetadataType.RELATION
  >,
> = RegularFieldManifest<T> | RelationFieldManifest;
