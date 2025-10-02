import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { HTTPMethod } from 'src/engine/metadata-modules/route/route.entity';

@InputType()
class UpdateRouteInputUpdates {
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
}

@InputType()
export class UpdateRouteInput {
  @IsUUID()
  @IsNotEmpty()
  @Field({
    description: 'The id of the route to update',
  })
  id: string;

  @Type(() => UpdateRouteInputUpdates)
  @ValidateNested()
  @Field(() => UpdateRouteInputUpdates, {
    description: 'The route updates',
  })
  update: UpdateRouteInputUpdates;
}
