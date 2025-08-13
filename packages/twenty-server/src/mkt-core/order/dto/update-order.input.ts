import { Field, InputType, Float } from '@nestjs/graphql';

import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { OrderStatusGraphQL } from 'src/mkt-core/order/graphql/order-status.enum';
import { CreateOrderItemInput } from 'src/mkt-core/order/dto/create-order-item.input';

@InputType()
export class UpdateOrderInput {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  position?: number;

  @Field(() => OrderStatusGraphQL, { nullable: true })
  @IsOptional()
  status?: OrderStatusGraphQL;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireContract?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountOwnerId?: string;

  @Field(() => [CreateOrderItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInput)
  items?: CreateOrderItemInput[];
}
