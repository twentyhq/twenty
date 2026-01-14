import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import type { Sources } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
class UpdateServerlessFunctionInputUpdates {
  @IsString()
  @Field()
  @IsOptional()
  name?: string;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @IsNumber()
  @Field({ nullable: true })
  @Min(1)
  @Max(900)
  @IsOptional()
  timeoutSeconds?: number;

  @Field(() => graphqlTypeJson)
  @IsObject()
  code: Sources;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  handlerName?: string;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  handlerPath?: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  @IsObject()
  @IsOptional()
  toolInputSchema?: object;

  @IsBoolean()
  @Field({ nullable: true })
  @IsOptional()
  isTool?: boolean;
}

@InputType()
export class UpdateServerlessFunctionInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the serverless function to update',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Type(() => UpdateServerlessFunctionInputUpdates)
  @ValidateNested()
  @Field(() => UpdateServerlessFunctionInputUpdates, {
    description: 'The serverless function updates',
  })
  update: UpdateServerlessFunctionInputUpdates;
}
