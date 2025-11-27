import { type FieldMetadataType } from 'twenty-shared/types';
import { type RelationType } from 'typeorm/metadata/types/RelationTypes';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  RelationException,
  RelationExceptionCode,
} from 'src/engine/twenty-orm/exceptions/relation.exception';
import { converRelationTypeToTypeORMRelationType } from 'src/engine/twenty-orm/utils/convert-relation-type-to-typeorm-relation-type.util';

interface RelationDetails {
  relationType: RelationType;
  target: string;
  inverseSide: string;
  joinColumn: { name: string } | undefined;
}

export function determineSchemaRelationDetails(
  fieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): RelationDetails {
  if (!fieldMetadata.settings) {
    throw new Error('Field metadata settings are missing');
  }

  const relationType = converRelationTypeToTypeORMRelationType(
    fieldMetadata.settings.relationType,
  );

  if (!fieldMetadata.relationTargetObjectMetadataId) {
    throw new RelationException(
      'Relation target object metadata ID is missing',
      RelationExceptionCode.RELATION_OBJECT_METADATA_NOT_FOUND,
    );
  }

  const sourceObjectMetadata =
    flatObjectMetadataMaps.byId[fieldMetadata.objectMetadataId];
  const targetObjectMetadata =
    flatObjectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

  if (!sourceObjectMetadata || !targetObjectMetadata) {
    throw new RelationException(
      `Object metadata not found for field ${fieldMetadata.id}`,
      RelationExceptionCode.RELATION_OBJECT_METADATA_NOT_FOUND,
    );
  }

  if (!fieldMetadata.relationTargetFieldMetadataId) {
    throw new RelationException(
      'Relation target field metadata ID is missing',
      RelationExceptionCode.RELATION_TARGET_FIELD_METADATA_ID_NOT_FOUND,
    );
  }

  const targetFieldMetadata =
    flatFieldMetadataMaps.byId[fieldMetadata.relationTargetFieldMetadataId];

  if (!targetFieldMetadata) {
    throw new Error('Target field metadata not found');
  }

  return {
    relationType,
    target: targetObjectMetadata.nameSingular,
    inverseSide: targetFieldMetadata.name,
    joinColumn: fieldMetadata.settings.joinColumnName
      ? { name: fieldMetadata.settings.joinColumnName }
      : undefined,
  };
}
