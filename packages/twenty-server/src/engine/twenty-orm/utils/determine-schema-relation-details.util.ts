import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
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

export async function determineSchemaRelationDetails(
  fieldMetadata: FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
  objectMetadataMaps: ObjectMetadataMaps,
): Promise<RelationDetails> {
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
    objectMetadataMaps.byId[fieldMetadata.objectMetadataId];
  const targetObjectMetadata =
    objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

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
    targetObjectMetadata.fieldsById[
      fieldMetadata.relationTargetFieldMetadataId
    ];

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
