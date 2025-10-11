import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { ServerlessFunctionCode } from 'src/engine/metadata-modules/serverless-function/types/serverless-function-code.type';

@InputType()
export class CreateServerlessFunctionInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsNumber()
  @Field({ nullable: true })
  @Min(1)
  @Max(900)
  @IsOptional()
  timeoutSeconds?: number;

  @HideField()
  applicationId?: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  serverlessFunctionLayerId?: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  @IsObject()
  @IsOptional()
  code?: ServerlessFunctionCode;
}
