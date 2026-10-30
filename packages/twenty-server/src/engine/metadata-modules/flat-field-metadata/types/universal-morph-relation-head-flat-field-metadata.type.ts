import { type FieldMetadataType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type UniversalMorphRelationHeadFlatFieldMetadata = Omit<
  UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
  | 'relationTargetFieldMetadataUniversalIdentifier'
  | 'relationTargetObjectMetadataUniversalIdentifier'
> & {
  relationTargetFieldMetadataUniversalIdentifier: null;
  relationTargetObjectMetadataUniversalIdentifier: null;
};
