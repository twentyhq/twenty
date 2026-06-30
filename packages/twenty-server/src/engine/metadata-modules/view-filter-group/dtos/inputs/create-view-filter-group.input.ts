import { Field, InputType } from '@nestjs/graphql';

import { ViewFilterGroupLogicalOperator } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateViewFilterGroupInput {
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  parentViewFilterGroupId?: string;

  @Field(() => ViewFilterGroupLogicalOperator, {
    nullable: true,
    defaultValue: ViewFilterGroupLogicalOperator.AND,
  })
  logicalOperator?: ViewFilterGroupLogicalOperator;

  @Field({ nullable: true })
  positionInViewFilterGroup?: number;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;
}
