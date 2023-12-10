import { RelationMetadataInterface } from 'src/metadata/field-metadata/interfaces/relation-metadata.interface';

export enum RelationDirection {
  FROM = 'from',
  TO = 'to',
}

export const deduceRelationDirection = (
  currentObjectId: string,
  relationMetadata: RelationMetadataInterface,
): RelationDirection => {
  if (relationMetadata.fromObjectMetadataId === currentObjectId) {
    return RelationDirection.FROM;
  }

  if (relationMetadata.toObjectMetadataId === currentObjectId) {
    return RelationDirection.TO;
  }

  throw new Error(
    `Relation metadata ${relationMetadata.id} is not related to object ${currentObjectId}`,
  );
};
