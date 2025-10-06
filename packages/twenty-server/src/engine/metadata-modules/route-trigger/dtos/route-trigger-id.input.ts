import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class RouteTriggerIdInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  id: string;
}
