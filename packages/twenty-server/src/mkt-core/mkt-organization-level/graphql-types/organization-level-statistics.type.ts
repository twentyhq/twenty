import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('OrganizationLevelStatistics')
export class OrganizationLevelStatistics {
  // Level counts
  @Field(() => Int)
  totalLevels: number;

  @Field(() => Int)
  activeLevels: number;

  @Field(() => Int)
  maxHierarchyDepth: number;

  @Field(() => Int)
  rootLevelsCount: number;

  // Employee distribution
  @Field(() => Int)
  totalEmployees: number;

  @Field(() => Int)
  activeEmployees: number;

  @Field(() => [LevelEmployeeCount])
  employeesByLevel: LevelEmployeeCount[];

  // Performance metrics
  @Field(() => Int)
  levelsWithoutEmployees: number;

  @Field(() => Int)
  levelsExceedingRecommendedSize: number;

  @Field(() => Boolean)
  hasGapsInHierarchy: boolean;

  @Field(() => Boolean)
  hasCircularReferences: boolean;

  // Recommendations
  @Field(() => [String])
  recommendations: string[];
}

@ObjectType('LevelEmployeeCount')
export class LevelEmployeeCount {
  @Field(() => String)
  levelId: string;

  @Field(() => String)
  levelName: string;

  @Field(() => Int)
  hierarchyLevel: number;

  @Field(() => Int)
  employeeCount: number;

  @Field(() => Int)
  activeEmployeeCount: number;

  @Field(() => String, { nullable: true })
  status?: 'normal' | 'understaffed' | 'overstaffed';
}
