import { Field, ID, ObjectType } from '@nestjs/graphql';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

import { ObjectMetadataInterface } from './object-metadata.interface';
import { FieldMetadataInterface } from './field-metadata.interface';

@ObjectType()
export class RelationMetadataInterface {
  @Field(() => ID)
  id: string;

  @Field(() => RelationMetadataType)
  relationType: RelationMetadataType;

  @Field(() => String)
  fromObjectMetadataId: string;

  fromObjectMetadata: ObjectMetadataInterface;

  @Field(() => String)
  toObjectMetadataId: string;

  toObjectMetadata: ObjectMetadataInterface;

  @Field(() => String)
  fromFieldMetadataId: string;

  @Field(() => FieldMetadataInterface)
  fromFieldMetadata: FieldMetadataInterface;

  @Field(() => String)
  toFieldMetadataId: string;

  @Field(() => FieldMetadataInterface)
  toFieldMetadata: FieldMetadataInterface;
}
