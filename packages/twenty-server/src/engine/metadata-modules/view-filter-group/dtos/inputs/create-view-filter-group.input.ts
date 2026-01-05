import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';

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
