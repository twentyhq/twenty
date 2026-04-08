import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType('PathCommandMenuItemPayload')
export class PathCommandMenuItemPayloadDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  path: string;
}
