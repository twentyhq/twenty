import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class DatabaseEventTriggerIdInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  id: string;
}
