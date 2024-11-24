import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { computeRelationType } from 'src/engine/twenty-orm/utils/compute-relation-type.util';

interface RelationDetails {
  relationType: RelationType;
  target: string;
  inverseSide: string;
  joinColumn: { name: string } | undefined;
}

export async function determineRelationDetails(
  fieldMetadata: FieldMetadataInterface,
  relationMetadata: RelationMetadataEntity,
  objectMetadataMaps: ObjectMetadataMaps,
): Promise<RelationDetails> {
  const relationType = computeRelationType(fieldMetadata, relationMetadata);
  const fromObjectMetadata =
    objectMetadataMaps.byId[fieldMetadata.objectMetadataId];
  let toObjectMetadata =
    objectMetadataMaps.byId[relationMetadata.toObjectMetadataId];

  // RelationMetadata always store the relation from the perspective of the `from` object, MANY_TO_ONE relations are not stored yet
  if (relationType === 'many-to-one') {
    toObjectMetadata =
      objectMetadataMaps.byId[relationMetadata.fromObjectMetadataId];
  }

  if (!fromObjectMetadata || !toObjectMetadata) {
    throw new Error('Object metadata not found');
  }

  const toFieldMetadata = Object.values(toObjectMetadata.fieldsById).find(
    (field) =>
      relationType === 'many-to-one'
        ? field.id === relationMetadata.fromFieldMetadataId
        : field.id === relationMetadata.toFieldMetadataId,
  );

  if (!toFieldMetadata) {
    throw new Error('To field metadata not found');
  }

  // TODO: Support many to many relations
  if (relationType === 'many-to-many') {
    throw new Error('Many to many relations are not supported yet');
  }

  return {
    relationType,
    target: toObjectMetadata.nameSingular,
    inverseSide: toFieldMetadata.name,
    joinColumn:
      // TODO: This will work for now but we need to handle this better in the future for custom names on the join column
      relationType === 'many-to-one' ||
      (relationType === 'one-to-one' &&
        relationMetadata.toObjectMetadataId === fieldMetadata.objectMetadataId)
        ? { name: `${fieldMetadata.name}` + 'Id' }
        : undefined,
  };
}
