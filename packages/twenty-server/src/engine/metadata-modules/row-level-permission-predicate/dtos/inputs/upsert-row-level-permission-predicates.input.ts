/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-group-logical-operator.enum';
import { RowLevelPermissionPredicateOperand } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-operand';
import { RowLevelPermissionPredicateValue } from 'src/engine/metadata-modules/row-level-permission-predicate/types/row-level-permission-predicate-value.type';

@InputType()
export class RowLevelPermissionPredicateInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @Field(() => RowLevelPermissionPredicateOperand)
  operand: RowLevelPermissionPredicateOperand;

  @Field(() => GraphQLJSON, { nullable: true })
  value?: RowLevelPermissionPredicateValue | null;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @Field(() => String, { nullable: true })
  workspaceMemberFieldMetadataId?: string | null;

  @Field(() => String, { nullable: true })
  workspaceMemberSubFieldName?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  rowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;
}

@InputType()
export class RowLevelPermissionPredicateGroupInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  parentRowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => RowLevelPermissionPredicateGroupLogicalOperator)
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;
}

@InputType()
export class UpsertRowLevelPermissionPredicatesInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  roleId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RowLevelPermissionPredicateInput)
  @Field(() => [RowLevelPermissionPredicateInput])
  predicates: RowLevelPermissionPredicateInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RowLevelPermissionPredicateGroupInput)
  @Field(() => [RowLevelPermissionPredicateGroupInput])
  predicateGroups: RowLevelPermissionPredicateGroupInput[];
}
