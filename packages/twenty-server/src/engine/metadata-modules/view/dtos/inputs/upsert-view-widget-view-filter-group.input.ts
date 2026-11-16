import { Field, Float, InputType } from '@nestjs/graphql';

import { IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ViewFilterGroupLogicalOperator } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertViewWidgetViewFilterGroupInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  parentViewFilterGroupId?: string | null;

  @Field(() => ViewFilterGroupLogicalOperator, {
    nullable: true,
    defaultValue: ViewFilterGroupLogicalOperator.AND,
  })
  logicalOperator?: ViewFilterGroupLogicalOperator;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, { nullable: true })
  positionInViewFilterGroup?: number | null;
}
