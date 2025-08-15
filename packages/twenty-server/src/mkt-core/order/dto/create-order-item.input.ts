import { Field, InputType, Int } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateOrderItemInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  mktProductId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
