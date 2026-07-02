import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type FieldMetadataDefaultValue,
  type FieldMetadataOptions,
  type FieldMetadataType,
  type FieldMetadataUniversalSettings,
  type RelationAndMorphRelationFieldMetadataType,
} from '@/types';

type BaseRegularFieldManifest<
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
  options?: FieldMetadataOptions<T>;
  universalSettings?: FieldMetadataUniversalSettings<T>;
  isUIEditable?: boolean;
  isUnique?: boolean;
  objectUniversalIdentifier: string;
};

type RegularFieldManifestNullability<T extends FieldMetadataType> =
  | {
      defaultValue: FieldMetadataDefaultValue<T>;
      isNullable?: boolean;
    }
  | {
      defaultValue?: FieldMetadataDefaultValue<T>;
      isNullable?: true;
    };

export type RegularFieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    RelationAndMorphRelationFieldMetadataType
  >,
> = BaseRegularFieldManifest<T> & RegularFieldManifestNullability<T>;

export type RelationFieldManifest<
  T extends RelationAndMorphRelationFieldMetadataType =
    RelationAndMorphRelationFieldMetadataType,
> = Omit<BaseRegularFieldManifest<T>, 'universalSettings' | 'type'> & {
  type: T;
  isNullable?: boolean;
  defaultValue?: FieldMetadataDefaultValue<T>;
  relationTargetFieldMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
  universalSettings: FieldMetadataUniversalSettings<T>;
} & ([T] extends [FieldMetadataType.MORPH_RELATION]
    ? {
        morphId: string;
      }
    : {
        morphId?: undefined;
      });

export type FieldManifest<T extends FieldMetadataType = FieldMetadataType> =
  T extends RelationAndMorphRelationFieldMetadataType
    ? RelationFieldManifest<
        Extract<T, RelationAndMorphRelationFieldMetadataType>
      >
    : RegularFieldManifest<
        Exclude<T, RelationAndMorphRelationFieldMetadataType>
      >;
