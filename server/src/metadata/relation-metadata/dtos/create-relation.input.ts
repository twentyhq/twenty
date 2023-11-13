import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { BeforeCreateOneRelation } from 'src/metadata/relation-metadata/hooks/before-create-one-relation.hook';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

@InputType()
@BeforeCreateOne(BeforeCreateOneRelation)
export class CreateRelationInput {
  @IsEnum(RelationMetadataType)
  @IsNotEmpty()
  @Field(() => RelationMetadataType)
  relationType: RelationMetadataType;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  fromObjectMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  toObjectMetadataId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @HideField()
  workspaceId: string;
}
