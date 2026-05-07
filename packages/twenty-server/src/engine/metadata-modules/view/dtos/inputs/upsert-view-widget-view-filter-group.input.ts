import { Field, InputType } from '@nestjs/graphql';

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
  parentViewFilterGroupId?: string;

  @Field(() => ViewFilterGroupLogicalOperator, {
    nullable: true,
    defaultValue: ViewFilterGroupLogicalOperator.AND,
  })
  logicalOperator?: ViewFilterGroupLogicalOperator;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  positionInViewFilterGroup?: number;
}
