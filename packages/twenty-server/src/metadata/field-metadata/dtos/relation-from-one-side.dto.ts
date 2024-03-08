import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';

import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';
import { ObjectMetadataDTO } from 'src/metadata/object-metadata/dtos/object-metadata.dto';
import { RelationMetadataDTO } from 'src/metadata/relation-metadata/dtos/relation-metadata.dto';

export enum RelationFromOneSideType {
  'MANY_TO_ONE',
  'ONE_TO_MANY',
  'ONE_TO_ONE',
}

registerEnumType(RelationFromOneSideType, {
  name: 'RelationFromOneSideType',
  description: 'Relation from one side type',
});

@ObjectType('RelationFromOneSide')
export class RelationFromOneSideDTO {
  @Field(() => ObjectMetadataDTO, { nullable: true })
  sourceObjectMetadata: ObjectMetadataDTO;

  @Field(() => ObjectMetadataDTO, { nullable: true })
  targetObjectMetadata: ObjectMetadataDTO;

  @Field(() => FieldMetadataDTO, { nullable: true })
  sourceFieldMetadata: FieldMetadataDTO;

  @Field(() => FieldMetadataDTO, { nullable: true })
  targetFieldMetadataForOppositeSide: FieldMetadataDTO;

  @IsEnum(RelationFromOneSideType)
  @IsNotEmpty()
  @Field(() => RelationFromOneSideType)
  direction: RelationFromOneSideType;

  @Field(() => RelationMetadataDTO, { nullable: true })
  originalRelationMetadata: RelationMetadataDTO;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  fieldMappingOverview?: string;
}
