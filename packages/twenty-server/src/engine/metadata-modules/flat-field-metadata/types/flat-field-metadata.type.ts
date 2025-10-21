import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const FIELD_METADATA_RELATION_PROPERTIES = [
  'relationTargetFieldMetadata',
  'relationTargetObjectMetadata',
  'fieldPermissions',
  'indexFieldMetadatas',
  'object',
  'viewFields',
  'application',
  'viewFilters',
  'viewGroups',
  'kanbanAggregateOperationViews',
] as const satisfies (keyof FieldMetadataEntity)[];

export type FieldMetadataEntityRelationProperties =
  (typeof FIELD_METADATA_RELATION_PROPERTIES)[number];

export type FlatFieldMetadata<T extends FieldMetadataType = FieldMetadataType> =
  Omit<FieldMetadataEntity<T>, FieldMetadataEntityRelationProperties> & {
    universalIdentifier: string;
    viewFieldIds: string[];
    viewFilterIds: string[];
    viewGroupIds: string[];
    kanbanAggregateOperationViewIds: string[];
  };
