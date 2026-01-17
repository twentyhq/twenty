import { type FieldManifest } from '@/application/fieldManifestType';
import { type FieldMetadataType } from '@/types';
import { type RelationOnDeleteAction } from '@/types/RelationOnDeleteAction.type';
import { type RelationType } from '@/types/RelationType';

export type RelationFieldManifest =
  FieldManifest<FieldMetadataType.RELATION> & {
    relationType: RelationType;
    targetObjectUniversalIdentifier: string;
    targetFieldLabel: string;
    targetFieldIcon?: string;
    onDelete?: RelationOnDeleteAction;
  };
