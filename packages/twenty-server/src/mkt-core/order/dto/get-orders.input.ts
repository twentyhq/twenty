import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';

import { IsOptional, Min, Max, IsEnum } from 'class-validator';

export enum OrderSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TOTAL_AMOUNT = 'totalAmount',
  ORDER_CODE = 'orderCode',
  NAME = 'name',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(OrderSortBy, {
  name: 'OrderSortBy',
});

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@InputType()
export class GetOrdersInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @Field(() => OrderSortBy, { defaultValue: OrderSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(OrderSortBy)
  sortBy?: OrderSortBy = OrderSortBy.CREATED_AT;

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
