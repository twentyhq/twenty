import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { Prettify } from 'zod/v4/core/util.cjs';

export const FIELD_METADATA_RELATION_PROPERTIES = [
  'relationTargetFieldMetadata',
  'relationTargetObjectMetadata',
  'fieldPermissions',
  'indexFieldMetadatas',
  'object',
  'viewFields',
  'application',
  'viewFilters',
  'kanbanAggregateOperationViews',
  'calendarViews',
  'mainGroupByFieldMetadataViews',
  'viewGroups',
] as const satisfies (keyof FieldMetadataEntity)[];

export type FieldMetadataEntityRelationProperties =
  (typeof FIELD_METADATA_RELATION_PROPERTIES)[number];

export type FlatFieldMetadata<T extends FieldMetadataType = FieldMetadataType> =
  FlatEntityFrom<
    FieldMetadataEntity<T>,
    FieldMetadataEntityRelationProperties
  > & {
    universalIdentifier: string;
    viewFieldIds: string[];
    viewFilterIds: string[];
    kanbanAggregateOperationViewIds: string[];
    calendarViewIds: string[];
    mainGroupByFieldMetadataViewIds: string[];
  };

type toto3 = FlatEntityFrom<
  FieldMetadataEntity<FieldMetadataType.SELECT>,
  FieldMetadataEntityRelationProperties | 'viewGroups'
>;

type coco = Prettify<toto3>

const {options} = {} as FlatFieldMetadata<FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT | FieldMetadataType.RATING>
