import { isDefined } from 'twenty-shared/utils';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const isRelationFieldMetadataWithTarget = <
  TFieldMetadata extends OrmFlatFieldMetadata,
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata &
  FlatFieldMetadata<MorphOrRelationFieldMetadataType> & {
    relationTargetFieldMetadataId: string;
    relationTargetObjectMetadataId: string;
  } =>
  isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
  isDefined(fieldMetadata.relationTargetFieldMetadataId) &&
  isDefined(fieldMetadata.relationTargetObjectMetadataId);
