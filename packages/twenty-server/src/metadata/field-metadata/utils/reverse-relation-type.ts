import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

export const reverseRelationType = (relationType: RelationMetadataType) => {
  if (relationType === RelationMetadataType.ONE_TO_MANY) {
    return RelationMetadataType.MANY_TO_ONE;
  } else if (relationType === RelationMetadataType.MANY_TO_ONE) {
    return RelationMetadataType.ONE_TO_MANY;
  }

  return relationType;
};
