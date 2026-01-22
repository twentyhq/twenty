import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { HTTPMethod } from 'twenty-shared/types';

@InputType()
export class CreateRouteTriggerInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  path: string;

  @IsBoolean()
  @IsNotEmpty()
  @Field({ defaultValue: true })
  isAuthRequired: boolean;

  @IsEnum(HTTPMethod)
  @IsNotEmpty()
  @Field(() => HTTPMethod, { defaultValue: HTTPMethod.GET })
  httpMethod: HTTPMethod;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  serverlessFunctionId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], {
    defaultValue: [],
    description:
      'List of HTTP header names to forward to the serverless function event',
  })
  forwardedRequestHeaders: string[];

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
