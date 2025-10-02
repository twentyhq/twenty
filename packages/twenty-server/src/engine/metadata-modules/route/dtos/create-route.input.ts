import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

import { HTTPMethod } from 'src/engine/metadata-modules/route/route.entity';

@InputType()
export class CreateRouteInput {
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

  @IsUUID()
  @IsNotEmpty()
  @Field()
  serverlessFunctionId: string;

  @HideField()
  universalIdentifier?: string;
}
