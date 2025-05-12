import { registerEnumType } from '@nestjs/graphql';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export enum RelationMetadataType {
  ONE_TO_ONE = RelationMetadataType.ONE_TO_ONE,
  ONE_TO_MANY = RelationMetadataType.ONE_TO_MANY,
  MANY_TO_MANY = RelationMetadataType.MANY_TO_MANY,
  MANY_TO_ONE = 'MANY_TO_ONE',
}

registerEnumType(RelationMetadataType, {
  name: 'RelationMetadataType',
  description: 'Relation definition type',
});
