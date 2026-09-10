import {
  MORPH_OR_RELATION_FIELD_TYPES,
  type MorphOrRelationFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const isMorphOrRelationFlatFieldMetadata = <
  T extends OrmFlatFieldMetadata<FieldMetadataType>,
>(
  flatFieldMetadata: T,
): flatFieldMetadata is T &
  FlatFieldMetadata<MorphOrRelationFieldMetadataType> =>
  isFlatFieldMetadataOfTypes(flatFieldMetadata, [
    ...MORPH_OR_RELATION_FIELD_TYPES,
  ]);

export const isMorphOrRelationUniversalFlatFieldMetadata = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata,
): universalFlatFieldMetadata is UniversalFlatFieldMetadata<MorphOrRelationFieldMetadataType> =>
  isFlatFieldMetadataOfTypes(universalFlatFieldMetadata, [
    ...MORPH_OR_RELATION_FIELD_TYPES,
  ]);
