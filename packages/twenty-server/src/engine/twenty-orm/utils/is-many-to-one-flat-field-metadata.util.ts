import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const isManyToOneFlatFieldMetadata = (
  flatFieldMetadata: OrmFlatFieldMetadata<MorphOrRelationFieldMetadataType>,
): boolean =>
  flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;
