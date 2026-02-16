import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import type {
  FieldMetadataDefaultValue,
  FieldMetadataOptions,
  FieldMetadataType,
  FieldMetadataUniversalSettings,
  RelationAndMorphRelationFieldMetadataType,
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

export type RelationFieldManifest<
  T extends
    RelationAndMorphRelationFieldMetadataType = RelationAndMorphRelationFieldMetadataType,
> = RegularFieldManifest<T> & {
  relationTargetFieldMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
};

export type FieldManifest<T extends FieldMetadataType = FieldMetadataType> =
  T extends RelationAndMorphRelationFieldMetadataType
    ? RelationFieldManifest<
        Extract<T, RelationAndMorphRelationFieldMetadataType>
      >
    : RegularFieldManifest<
        Exclude<T, RelationAndMorphRelationFieldMetadataType>
      >;
