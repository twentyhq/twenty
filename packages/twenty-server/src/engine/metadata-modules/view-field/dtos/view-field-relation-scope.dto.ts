import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import {
  AggregateOperations,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  type ViewFilterValue,
  ViewSortDirection,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ViewFieldRelationScopeFilter')
export class ViewFieldRelationScopeFilterDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @Field(() => ViewFilterOperand)
  operand: ViewFilterOperand;

  @Field(() => GraphQLJSON)
  value: ViewFilterValue;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  filterGroupId?: string | null;
}

@ObjectType('ViewFieldRelationScopeFilterGroup')
export class ViewFieldRelationScopeFilterGroupDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  parentFilterGroupId?: string | null;

  @Field(() => ViewFilterGroupLogicalOperator)
  logicalOperator: ViewFilterGroupLogicalOperator;
}

@ObjectType('ViewFieldRelationScopeSort')
export class ViewFieldRelationScopeSortDTO {
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @Field(() => ViewSortDirection)
  direction: ViewSortDirection;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string | null;
}

@ObjectType('ViewFieldRelationScope')
export class ViewFieldRelationScopeDTO {
  @Field(() => [ViewFieldRelationScopeFilterDTO])
  filters: ViewFieldRelationScopeFilterDTO[];

  @Field(() => [ViewFieldRelationScopeFilterGroupDTO])
  filterGroups: ViewFieldRelationScopeFilterGroupDTO[];

  @Field(() => [ViewFieldRelationScopeSortDTO])
  sorts: ViewFieldRelationScopeSortDTO[];

  @Field(() => Int, { nullable: true })
  limit?: number | null;

  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations | null;
}
