import { Field, InputType, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  AggregateOperations,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  type ViewFilterValue,
  ViewSortDirection,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ViewFieldRelationScopeFilterInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsEnum(ViewFilterOperand)
  @Field(() => ViewFilterOperand)
  operand: ViewFilterOperand;

  @IsDefined()
  @Field(() => GraphQLJSON)
  value: ViewFilterValue;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  filterGroupId?: string | null;
}

@InputType()
export class ViewFieldRelationScopeFilterGroupInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  id: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  parentFilterGroupId?: string | null;

  @IsEnum(ViewFilterGroupLogicalOperator)
  @Field(() => ViewFilterGroupLogicalOperator)
  logicalOperator: ViewFilterGroupLogicalOperator;
}

@InputType()
export class ViewFieldRelationScopeSortInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsEnum(ViewSortDirection)
  @Field(() => ViewSortDirection)
  direction: ViewSortDirection;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string | null;
}

@InputType()
export class ViewFieldRelationScopeInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ViewFieldRelationScopeFilterInput)
  @Field(() => [ViewFieldRelationScopeFilterInput], { defaultValue: [] })
  filters: ViewFieldRelationScopeFilterInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ViewFieldRelationScopeFilterGroupInput)
  @Field(() => [ViewFieldRelationScopeFilterGroupInput], { defaultValue: [] })
  filterGroups: ViewFieldRelationScopeFilterGroupInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ViewFieldRelationScopeSortInput)
  @Field(() => [ViewFieldRelationScopeSortInput], { defaultValue: [] })
  sorts: ViewFieldRelationScopeSortInput[];

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number | null;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations | null;
}
