import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
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

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ServerlessFunctionCode } from 'src/engine/metadata-modules/serverless-function/types/serverless-function-code.type';

@InputType()
class UpdateServerlessFunctionInputUpdates {
  @IsString()
  @Field()
  name: string;

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
  code: ServerlessFunctionCode;
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
