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

import { Sources } from 'src/engine/core-modules/file-storage/types/source.type';

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
  code?: Sources;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  handlerName?: string;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  handlerPath?: string;
}
