import {
  type FieldMetadataType,
  type FieldMetadataSettings,
  type FieldMetadataOptions,
  type FieldMetadataDefaultValue,
} from '@/types';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type RelationOnDeleteAction } from '@/types/RelationOnDeleteAction.type';
import { type RelationType } from '@/types/RelationType';

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
  settings?: FieldMetadataSettings<T>;
  isNullable?: boolean;
  objectUniversalIdentifier: string;
};

export type RelationFieldManifest =
  RegularFieldManifest<FieldMetadataType.RELATION> & {
    relationType: RelationType;
    targetObjectUniversalIdentifier: string;
    targetFieldLabel: string;
    targetFieldIcon?: string;
    onDelete?: RelationOnDeleteAction;
  };

export type FieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    FieldMetadataType.RELATION
  >,
> = RegularFieldManifest<T> | RelationFieldManifest;
