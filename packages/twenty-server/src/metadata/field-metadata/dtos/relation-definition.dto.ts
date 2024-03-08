import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';

import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';
import { ObjectMetadataDTO } from 'src/metadata/object-metadata/dtos/object-metadata.dto';
import { RelationMetadataDTO } from 'src/metadata/relation-metadata/dtos/relation-metadata.dto';

export enum RelationDefinitionType {
  'MANY_TO_ONE',
  'ONE_TO_MANY',
  'ONE_TO_ONE',
}

registerEnumType(RelationDefinitionType, {
  name: 'RelationDefinitionType',
  description: 'Relation definition type',
});

@ObjectType('RelationDefinition')
export class RelationDefinitionDTO {
  @Field(() => ObjectMetadataDTO, { nullable: true })
  sourceObjectMetadata: ObjectMetadataDTO;

  @Field(() => ObjectMetadataDTO, { nullable: true })
  targetObjectMetadata: ObjectMetadataDTO;

  @Field(() => FieldMetadataDTO, { nullable: true })
  sourceFieldMetadata: FieldMetadataDTO;

  @Field(() => FieldMetadataDTO, { nullable: true })
  targetFieldMetadataForOppositeSide: FieldMetadataDTO;

  @IsEnum(RelationDefinitionType)
  @IsNotEmpty()
  @Field(() => RelationDefinitionType)
  direction: RelationDefinitionType;

  @Field(() => RelationMetadataDTO, { nullable: true })
  originalRelationMetadata: RelationMetadataDTO;
}
