import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
import { ViewFilterOperand } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

registerEnumType(ViewFilterOperand, {
  name: 'ViewFilterOperand',
});

@ObjectType('CoreViewFilter')
export class ViewFilterDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: false, defaultValue: ViewFilterOperand.CONTAINS })
  operand: ViewFilterOperand;

  @Field(() => GraphQLJSON, { nullable: false })
  value: ViewFilterValue;

  @Field(() => UUIDScalarType, { nullable: true })
  viewFilterGroupId?: string | null;

  @Field(() => Number, { nullable: true })
  positionInViewFilterGroup?: number | null;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

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
