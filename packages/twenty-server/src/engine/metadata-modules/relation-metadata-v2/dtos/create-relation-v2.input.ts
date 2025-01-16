import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { BeforeCreateOneRelationV2 } from 'src/engine/metadata-modules/relation-metadata-v2/hooks/before-create-one-relation-v2.hook';
import { RelationMetadataTypeV2 } from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.entity';

@InputType()
@BeforeCreateOne(BeforeCreateOneRelationV2)
export class CreateRelationV2Input {
  @IsEnum(RelationMetadataTypeV2)
  @IsNotEmpty()
  @Field(() => RelationMetadataTypeV2)
  relationType: RelationMetadataTypeV2;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  sourceObjectMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  targetObjectMetadataId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  sourceName: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  targetName: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  sourceLabel: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  targetLabel: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  sourceIcon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  targetIcon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  sourceDescription?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  targetDescription?: string;

  @HideField()
  workspaceId: string;
}
