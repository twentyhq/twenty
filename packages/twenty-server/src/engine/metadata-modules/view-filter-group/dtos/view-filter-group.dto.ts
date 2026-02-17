import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { ViewFilterGroupLogicalOperator } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

registerEnumType(ViewFilterGroupLogicalOperator, {
  name: 'ViewFilterGroupLogicalOperator',
});

@ObjectType('CoreViewFilterGroup')
export class ViewFilterGroupDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  parentViewFilterGroupId?: string | null;

  @Field(() => ViewFilterGroupLogicalOperator, {
    nullable: false,
    defaultValue: ViewFilterGroupLogicalOperator.NOT,
  })
  logicalOperator: ViewFilterGroupLogicalOperator;

  @Field(() => Number, { nullable: true })
  positionInViewFilterGroup?: number | null;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
