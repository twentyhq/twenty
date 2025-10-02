import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class RouteIdInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  id: string;
}
