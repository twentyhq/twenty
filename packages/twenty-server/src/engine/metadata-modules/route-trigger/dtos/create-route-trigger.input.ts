import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
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

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
