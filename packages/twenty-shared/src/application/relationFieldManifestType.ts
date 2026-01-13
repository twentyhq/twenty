import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type FieldMetadataType } from '@/types';
import { type RelationOnDeleteAction } from '@/types/RelationOnDeleteAction.type';
import { type RelationType } from '@/types/RelationType';

export type RelationFieldManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  description?: string;
  icon?: string;
  relationType: RelationType;
  targetObjectUniversalIdentifier: string;
  targetFieldLabel: string;
  targetFieldIcon?: string;
  onDelete?: RelationOnDeleteAction;
  type: FieldMetadataType.RELATION;
};
