import { Field, ObjectType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@ObjectType()
export class CreateOneRabbitSignSignatureOutput {
  @Field(() => String)
  @IsString()
  id: string;
}
