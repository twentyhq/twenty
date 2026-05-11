import {
  type FieldMetadataType,
  RelationType as TwentyRelationType,
} from 'twenty-shared/types';

import { type RelationType } from 'typeorm/metadata/types/RelationTypes';

import {
  RelationException,
  RelationExceptionCode,
} from 'src/engine/twenty-orm/exceptions/relation.exception';
import {
  type EntitySchemaFieldMetadata,
  type EntitySchemaFieldMetadataMaps,
  type EntitySchemaObjectMetadataMaps,
} from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { converRelationTypeToTypeORMRelationType } from 'src/engine/twenty-orm/utils/convert-relation-type-to-typeorm-relation-type.util';

interface RelationDetails {
  relationType: RelationType;
  target: string;
  inverseSide: string;
  joinColumn: { name: string } | undefined;
}

export function determineSchemaRelationDetails(
  fieldMetadata: EntitySchemaFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
  objectMetadataMaps: EntitySchemaObjectMetadataMaps,
  fieldMetadataMaps: EntitySchemaFieldMetadataMaps,
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

  const targetObjectMetadata =
    objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

  if (!targetObjectMetadata) {
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
    fieldMetadataMaps.byId[fieldMetadata.relationTargetFieldMetadataId];

  if (!targetFieldMetadata) {
    throw new Error('Target field metadata not found');
  }

  const isManyToOne =
    fieldMetadata.settings.relationType === TwentyRelationType.MANY_TO_ONE;

  return {
    relationType,
    target: targetObjectMetadata.nameSingular,
    inverseSide: targetFieldMetadata.name,
    joinColumn: isManyToOne
      ? {
          name: computeMorphOrRelationFieldJoinColumnName({
            name: fieldMetadata.name,
          }),
        }
      : undefined,
  };
}
