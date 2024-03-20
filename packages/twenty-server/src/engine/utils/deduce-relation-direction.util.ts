import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-metadata.interface';

export enum RelationDirection {
  FROM = 'from',
  TO = 'to',
}

export const deduceRelationDirection = (
  fieldMetadata: FieldMetadataInterface,
  relationMetadata: RelationMetadataInterface,
): RelationDirection => {
  if (
    relationMetadata.fromObjectMetadataId === fieldMetadata.objectMetadataId &&
    relationMetadata.fromFieldMetadataId === fieldMetadata.id
  ) {
    return RelationDirection.FROM;
  }

  if (
    relationMetadata.toObjectMetadataId === fieldMetadata.objectMetadataId &&
    relationMetadata.toFieldMetadataId === fieldMetadata.id
  ) {
    return RelationDirection.TO;
  }

  throw new Error(
    `Relation metadata ${relationMetadata.id} is not related to object ${fieldMetadata.objectMetadataId}`,
  );
};
