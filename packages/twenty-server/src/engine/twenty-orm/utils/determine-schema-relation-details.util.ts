import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { converRelationTypeToTypeORMRelationType } from 'src/engine/twenty-orm/utils/convert-relation-type-to-typeorm-relation-type.util';

interface RelationDetails {
  relationType: RelationType;
  target: string;
  inverseSide: string;
  joinColumn: { name: string } | undefined;
}

export async function determineSchemaRelationDetails(
  fieldMetadata: FieldMetadataInterface<FieldMetadataType.RELATION>,
  objectMetadataMaps: ObjectMetadataMaps,
): Promise<RelationDetails> {
  if (!fieldMetadata.settings) {
    throw new Error('Field metadata settings are missing');
  }

  const relationType = converRelationTypeToTypeORMRelationType(
    fieldMetadata.settings.relationType,
  );

  if (!fieldMetadata.relationTargetObjectMetadataId) {
    throw new Error('Relation target object metadata ID is missing');
  }

  const sourceObjectMetadata =
    objectMetadataMaps.byId[fieldMetadata.objectMetadataId];
  const targetObjectMetadata =
    objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

  if (!sourceObjectMetadata || !targetObjectMetadata) {
    throw new Error('Object metadata not found');
  }

  if (!fieldMetadata.relationTargetFieldMetadataId) {
    throw new Error('Relation target field metadata ID is missing');
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
