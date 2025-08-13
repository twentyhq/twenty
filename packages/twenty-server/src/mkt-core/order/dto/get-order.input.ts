import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@InputType()
export class GetOrderInput {
  @Field()
  @IsUUID()
  id: string;
}
