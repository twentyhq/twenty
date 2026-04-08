import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType('PathNavigationPayload')
export class PathNavigationPayloadDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  path: string;
}
