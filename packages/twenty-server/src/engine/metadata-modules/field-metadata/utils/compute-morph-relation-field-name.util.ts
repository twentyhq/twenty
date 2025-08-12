import { capitalize } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type ComputeMorphRelationFieldNameArgs = {
  fieldName: string;
  relationDirection: RelationType;
  targetObjectMetadata: Pick<
    ObjectMetadataEntity,
    'nameSingular' | 'namePlural'
  >;
};

export const computeMorphRelationFieldName = ({
  fieldName,
  relationDirection,
  targetObjectMetadata,
}: ComputeMorphRelationFieldNameArgs): string => {
  if (relationDirection === RelationType.MANY_TO_ONE) {
    return `${fieldName}${capitalize(targetObjectMetadata.nameSingular)}`;
  }

  if (relationDirection === RelationType.ONE_TO_MANY) {
    return `${fieldName}${capitalize(targetObjectMetadata.namePlural)}`;
  }

  throw new Error(
    `Invalid relation direction: ${relationDirection} for field ${fieldName}`,
  );
};
