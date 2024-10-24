import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  RelationDirection,
  deduceRelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';

export const computeRelationType = (
  fieldMetadata: FieldMetadataInterface,
  relationMetadata: RelationMetadataEntity,
) => {
  const relationDirection = deduceRelationDirection(
    fieldMetadata,
    relationMetadata,
  );

  switch (relationMetadata.relationType) {
    case RelationMetadataType.ONE_TO_MANY: {
      return relationDirection === RelationDirection.FROM
        ? 'one-to-many'
        : 'many-to-one';
    }
    case RelationMetadataType.ONE_TO_ONE:
      return 'one-to-one';
    case RelationMetadataType.MANY_TO_MANY:
      return 'many-to-many';
    default:
      throw new Error('Invalid relation type');
  }
};
