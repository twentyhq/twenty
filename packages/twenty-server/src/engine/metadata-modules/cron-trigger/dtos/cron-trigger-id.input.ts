import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class CronTriggerIdInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String)
  id: string;
}
