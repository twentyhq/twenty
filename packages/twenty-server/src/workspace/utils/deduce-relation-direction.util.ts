import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { RelationMetadataInterface } from 'src/metadata/field-metadata/interfaces/relation-metadata.interface';

export enum RelationDirection {
  FROM = 'from',
  TO = 'to',
}

export const deduceRelationDirection = (
  fieldMetadata: FieldMetadataInterface,
  relationMetadata: RelationMetadataInterface,
): RelationDirection => {
  if (
    relationMetadata.fromObjectMetadataId === fieldMetadata.objectMetadataId
  ) {
    if (relationMetadata.fromFieldMetadataId === fieldMetadata.id) {
      return RelationDirection.FROM;
    }

    if (relationMetadata.toFieldMetadataId === fieldMetadata.id) {
      return RelationDirection.TO;
    }
  }

  if (
    relationMetadata.fromObjectMetadataId === fieldMetadata.objectMetadataId
  ) {
    return RelationDirection.FROM;
  }

  if (relationMetadata.toObjectMetadataId === fieldMetadata.objectMetadataId) {
    return RelationDirection.TO;
  }

  throw new Error(
    `Relation metadata ${relationMetadata.id} is not related to object ${fieldMetadata.objectMetadataId}`,
  );
};
