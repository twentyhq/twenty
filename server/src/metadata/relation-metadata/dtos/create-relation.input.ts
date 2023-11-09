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

import { RelationType } from './relation-metadata.dto';

@InputType()
@BeforeCreateOne(BeforeCreateOneRelation)
export class CreateRelationInput {
  @IsEnum(RelationType)
  @IsNotEmpty()
  @Field()
  relationType: RelationType;

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
