/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class RowLevelPermissionRulePredicateInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  relationFieldMetadataId?: string | null;

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

  @Field(() => Number, { nullable: true })
  position?: number | null;
}

@InputType()
export class RowLevelPermissionRulePredicateGroupInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => RowLevelPermissionPredicateGroupLogicalOperator)
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;

  @Field(() => Number, { nullable: true })
  position?: number | null;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowLevelPermissionRulePredicateInput)
  @Field(() => [RowLevelPermissionRulePredicateInput], { nullable: true })
  predicates?: RowLevelPermissionRulePredicateInput[] | null;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowLevelPermissionRulePredicateGroupInput)
  @Field(() => [RowLevelPermissionRulePredicateGroupInput], { nullable: true })
  predicateGroups?: RowLevelPermissionRulePredicateGroupInput[] | null;
}

@InputType()
export class RowLevelPermissionRuleInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canReadRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canCreateRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canUpdateRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canSoftDeleteRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canDestroyRecords?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowLevelPermissionRulePredicateInput)
  @Field(() => [RowLevelPermissionRulePredicateInput], { nullable: true })
  predicates?: RowLevelPermissionRulePredicateInput[] | null;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowLevelPermissionRulePredicateGroupInput)
  @Field(() => [RowLevelPermissionRulePredicateGroupInput], { nullable: true })
  predicateGroups?: RowLevelPermissionRulePredicateGroupInput[] | null;
}

@InputType()
export class UpsertRowLevelPermissionRulesInput {
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
  @Type(() => RowLevelPermissionRuleInput)
  @Field(() => [RowLevelPermissionRuleInput])
  rules: RowLevelPermissionRuleInput[];
}
