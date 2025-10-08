import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

import { HTTPMethod } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';

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
}
