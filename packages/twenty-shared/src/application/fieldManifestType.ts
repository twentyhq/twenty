import { type FieldManifestOptions } from '@/application/fieldManifestOptionsType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type FieldMetadataDefaultValue,
  type FieldMetadataType,
  type FieldMetadataUniversalSettings,
  type MetadataWritability,
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
  options?: FieldManifestOptions<T>;
  universalSettings?: FieldMetadataUniversalSettings<T>;
  isUIEditable?: boolean;
  writability?: MetadataWritability;
  isUnique?: boolean;
  isLabelSyncedWithName?: boolean;
  isSearchable?: boolean;
  isAuditLogged?: boolean;
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
  universalSettings: FieldMetadataUniversalSettings<T>;
} & ([T] extends [FieldMetadataType.MORPH_RELATION]
    ? {
        morphId: string;
      } & (
        | {
            relationTargetFieldMetadataUniversalIdentifier: null;
            relationTargetObjectMetadataUniversalIdentifier: null;
          }
        | {
            relationTargetFieldMetadataUniversalIdentifier: string;
            relationTargetObjectMetadataUniversalIdentifier: string;
          }
      )
    : {
        morphId?: undefined;
        relationTargetFieldMetadataUniversalIdentifier: string;
        relationTargetObjectMetadataUniversalIdentifier: string;
      });

export type FieldManifest<T extends FieldMetadataType = FieldMetadataType> =
  T extends RelationAndMorphRelationFieldMetadataType
    ? RelationFieldManifest<
        Extract<T, RelationAndMorphRelationFieldMetadataType>
      >
    : RegularFieldManifest<
        Exclude<T, RelationAndMorphRelationFieldMetadataType>
      >;
