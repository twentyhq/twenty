import { Field, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { BeforeCreateOneRelation } from 'src/metadata/relation-metadata/hooks/before-create-one-relation.hook';

@InputType()
@BeforeCreateOne(BeforeCreateOneRelation)
export class CreateRelationInput {
  @IsEnum(RelationMetadataType)
  @IsNotEmpty()
  @Field()
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

  workspaceId: string;
}
