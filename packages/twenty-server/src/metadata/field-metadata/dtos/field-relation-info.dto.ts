import { Field, ObjectType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';

import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';
import { ObjectMetadataDTO } from 'src/metadata/object-metadata/dtos/object-metadata.dto';
import { RelationMetadataDTO } from 'src/metadata/relation-metadata/dtos/relation-metadata.dto';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

@ObjectType('relationInfo')
export class FieldRelationInfoDTO {
  @Field(() => ObjectMetadataDTO, { nullable: true })
  sourceObjectMetadataItem: ObjectMetadataDTO;

  @Field(() => ObjectMetadataDTO, { nullable: true })
  targetObjectMetadataItem: ObjectMetadataDTO;

  @Field(() => FieldMetadataDTO, { nullable: true })
  sourceFieldMetadataItem: FieldMetadataDTO;

  @Field(() => FieldMetadataDTO, { nullable: true })
  targetFieldMetadataItem: FieldMetadataDTO;

  @IsEnum(RelationMetadataType)
  @IsNotEmpty()
  @Field(() => RelationMetadataType)
  relationType: RelationMetadataType;

  @Field(() => RelationMetadataDTO, { nullable: true })
  originalRelationMetadata: RelationMetadataDTO;
}
