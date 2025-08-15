import { Field, InputType, Float } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { OrderStatusGraphQL } from 'src/mkt-core/order/graphql/order-status.enum';
import { CreateOrderItemInput } from 'src/mkt-core/order/dto/create-order-item.input';

@InputType()
export class CreateOrderWithItemsInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  orderCode: string;

  @Field(() => OrderStatusGraphQL, { nullable: true })
  @IsOptional()
  status?: OrderStatusGraphQL;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  totalAmount?: number;

  @Field({ defaultValue: 'USD' })
  @IsOptional()
  @IsString()
  currency: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field({ nullable: true })
  @IsOptional()
  requireContract?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountOwnerId?: string;

  @Field(() => [CreateOrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInput)
  items: CreateOrderItemInput[];
}
