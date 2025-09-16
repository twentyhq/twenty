import { Field, InputType, Int } from '@nestjs/graphql';

import { Min, Max, IsInt } from 'class-validator';

import { IsValidHierarchyLevel } from 'src/mkt-core/mkt-organization-level/validators/hierarchy-level-range.validator';
import { OrganizationHierarchyLevel } from 'src/mkt-core/mkt-organization-level/constants';

@InputType('OrganizationLevelQueryOptions')
export class OrganizationLevelQueryOptions {
  @Field(() => Boolean, {
    defaultValue: true,
    description: 'Include inactive organization levels',
  })
  includeInactive?: boolean;

  @Field(() => Boolean, {
    defaultValue: true,
    description: 'Include employee statistics in response',
  })
  includeStatistics?: boolean;

  @Field(() => Boolean, {
    defaultValue: false,
    description: 'Include permission details in response',
  })
  includePermissions?: boolean;

  @Field(() => Int, {
    defaultValue: 8,
    description: 'Maximum hierarchy depth to traverse',
  })
  maxDepth?: number;

  @Field(() => [String], {
    nullable: true,
    description: 'Filter by specific level codes',
  })
  levelCodes?: string[];

  @Field(() => [Int], {
    nullable: true,
    description: 'Filter by specific hierarchy levels',
  })
  hierarchyLevels?: number[];
}

@InputType('CreateOrganizationLevelInput')
export class CreateOrganizationLevelInput {
  @Field(() => String)
  levelCode: string;

  @Field(() => String)
  levelName: string;

  @Field(() => String, { nullable: true })
  levelNameEn?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, {
    description: 'Hierarchy level (where 1 = highest level)',
  })
  @IsInt({ message: 'Hierarchy level must be a whole number' })
  @Min(OrganizationHierarchyLevel.MIN, {
    message: `Hierarchy level must be at least ${OrganizationHierarchyLevel.MIN.toString()}`,
  })
  @Max(OrganizationHierarchyLevel.MAX, {
    message: `Hierarchy level cannot exceed ${OrganizationHierarchyLevel.MAX.toString()}`,
  })
  @IsValidHierarchyLevel()
  hierarchyLevel: number;

  @Field(() => String, { nullable: true })
  parentLevelId?: string;

  @Field(() => Int, { defaultValue: 0 })
  displayOrder?: number;

  @Field(() => Boolean, { defaultValue: true })
  isActive?: boolean;
}

@InputType('UpdateOrganizationLevelInput')
export class UpdateOrganizationLevelInput {
  @Field(() => String, { nullable: true })
  levelCode?: string;

  @Field(() => String, { nullable: true })
  levelName?: string;

  @Field(() => String, { nullable: true })
  levelNameEn?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Hierarchy level (1-8, where 1 = highest level)',
  })
  @IsInt({ message: 'Hierarchy level must be a whole number' })
  @Min(OrganizationHierarchyLevel.MIN, {
    message: `Hierarchy level must be at least ${OrganizationHierarchyLevel.MIN.toString()}`,
  })
  @Max(OrganizationHierarchyLevel.MAX, {
    message: `Hierarchy level cannot exceed ${OrganizationHierarchyLevel.MAX.toString()}`,
  })
  @IsValidHierarchyLevel()
  hierarchyLevel?: number;

  @Field(() => String, { nullable: true })
  parentLevelId?: string;

  @Field(() => Int, { nullable: true })
  displayOrder?: number;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
