import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export enum RelationDefinitionType {
  ONE_TO_ONE = RelationMetadataType.ONE_TO_ONE,
  ONE_TO_MANY = RelationMetadataType.ONE_TO_MANY,
  MANY_TO_MANY = RelationMetadataType.MANY_TO_MANY,
  MANY_TO_ONE = 'MANY_TO_ONE',
}

registerEnumType(RelationDefinitionType, {
  name: 'RelationDefinitionType',
  description: 'Relation definition type',
});

@ObjectType('RelationDefinition')
export class RelationDefinitionDTO {
  @IsNotEmpty()
  @Field(() => ObjectMetadataDTO)
  sourceObjectMetadata: ObjectMetadataDTO;

  @IsNotEmpty()
  @Field(() => ObjectMetadataDTO)
  targetObjectMetadata: ObjectMetadataDTO;

  @IsNotEmpty()
  @Field(() => FieldMetadataDTO)
  sourceFieldMetadata: FieldMetadataDTO;

  @IsNotEmpty()
  @Field(() => FieldMetadataDTO)
  targetFieldMetadata: FieldMetadataDTO;

  @IsEnum(RelationDefinitionType)
  @IsNotEmpty()
  @Field(() => RelationDefinitionType)
  direction: RelationDefinitionType;
}
