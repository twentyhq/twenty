import { capitalize } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type ComputeMorphRelationFieldNameArgs = {
  fieldName: string;
  relationType: RelationType;
  targetObjectMetadata: Pick<
    ObjectMetadataEntity,
    'nameSingular' | 'namePlural'
  >;
};

export const computeMorphRelationFieldName = ({
  fieldName,
  relationType,
  targetObjectMetadata,
}: ComputeMorphRelationFieldNameArgs): string => {
  if (relationType === RelationType.MANY_TO_ONE) {
    return `${fieldName}${capitalize(targetObjectMetadata.nameSingular)}`;
  }

  return `${fieldName}${capitalize(targetObjectMetadata.namePlural)}`;
};
