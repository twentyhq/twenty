import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { HTTPMethod } from 'twenty-shared/types';

@InputType()
class UpdateRouteTriggerInputUpdates {
  @IsString()
  @IsNotEmpty()
  @Field()
  path: string;

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  isAuthRequired: boolean;

  @IsEnum(HTTPMethod)
  @IsNotEmpty()
  @Field(() => HTTPMethod)
  httpMethod: HTTPMethod;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], {
    defaultValue: [],
    description:
      'List of HTTP header names to forward to the serverless function event',
  })
  forwardedRequestHeaders: string[];
}

@InputType()
export class UpdateRouteTriggerInput {
  @IsUUID()
  @IsNotEmpty()
  @Field({
    description: 'The id of the route to update',
  })
  id: string;

  @Type(() => UpdateRouteTriggerInputUpdates)
  @ValidateNested()
  @Field(() => UpdateRouteTriggerInputUpdates, {
    description: 'The route updates',
  })
  update: UpdateRouteTriggerInputUpdates;
}
