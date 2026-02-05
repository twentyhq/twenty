import { Field, HideField, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateFrontComponentInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @IsOptional()
  @HideField()
  universalIdentifier?: string;

  @IsString()
  @IsOptional()
  @Field()
  name?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @HideField()
  sourceComponentPath?: string;

  @IsString()
  @IsOptional()
  @HideField()
  builtComponentPath?: string;

  @IsString()
  @HideField()
  componentName: string;

  @IsString()
  @IsOptional()
  @HideField()
  checksum?: string;
}
