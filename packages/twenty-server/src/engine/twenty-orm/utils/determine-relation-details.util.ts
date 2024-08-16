import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { computeRelationType } from 'src/engine/twenty-orm/utils/compute-relation-type.util';

interface RelationDetails {
  relationType: RelationType;
  target: string;
  inverseSide: string;
  joinColumn: { name: string } | undefined;
}

export async function determineRelationDetails(
  fieldMetadata: FieldMetadataEntity,
  relationMetadata: RelationMetadataEntity,
  objectMetadataCollection: ObjectMetadataEntity[],
): Promise<RelationDetails> {
  const relationType = computeRelationType(fieldMetadata, relationMetadata);
  let fromObjectMetadata: ObjectMetadataEntity | undefined =
    fieldMetadata.object;
  let toObjectMetadata: ObjectMetadataEntity | undefined =
    relationMetadata.toObjectMetadata;

  // RelationMetadata always store the relation from the perspective of the `from` object, MANY_TO_ONE relations are not stored yet
  if (relationType === 'many-to-one') {
    fromObjectMetadata = fieldMetadata.object;

    toObjectMetadata = objectMetadataCollection.find(
      (objectMetadata) =>
        objectMetadata.id === relationMetadata.fromObjectMetadataId,
    );
  }

  if (!fromObjectMetadata || !toObjectMetadata) {
    throw new Error('Object metadata not found');
  }

  // TODO: Support many to many relations
  if (relationType === 'many-to-many') {
    throw new Error('Many to many relations are not supported yet');
  }

  return {
    relationType,
    target: toObjectMetadata.nameSingular,
    inverseSide: fromObjectMetadata.nameSingular,
    joinColumn:
      // TODO: This will work for now but we need to handle this better in the future for custom names on the join column
      relationType === 'many-to-one' ||
      (relationType === 'one-to-one' &&
        relationMetadata.toObjectMetadataId === fieldMetadata.objectMetadataId)
        ? { name: `${fieldMetadata.name}` + 'Id' }
        : undefined,
  };
}
