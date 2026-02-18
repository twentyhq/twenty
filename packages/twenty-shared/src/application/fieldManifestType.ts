import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type FieldMetadataDefaultValue,
  type FieldMetadataOptions,
  type FieldMetadataType,
  type FieldMetadataUniversalSettings,
  type RelationAndMorphRelationFieldMetadataType,
} from '@/types';

export type RegularFieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    RelationAndMorphRelationFieldMetadataType
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
// Relation-specific universal settings (relationType, onDelete, joinColumnName)
// are provided through the `universalSettings` field.
export type RelationFieldManifest<
  T extends
    RelationAndMorphRelationFieldMetadataType = RelationAndMorphRelationFieldMetadataType,
> = RegularFieldManifest<T> & {
  relationTargetFieldMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
};

export type FieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    RelationAndMorphRelationFieldMetadataType
  >,
> = RegularFieldManifest<T> | RelationFieldManifest;
