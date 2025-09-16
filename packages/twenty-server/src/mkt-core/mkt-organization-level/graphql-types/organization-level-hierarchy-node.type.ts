import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';

@ObjectType('OrganizationLevelHierarchyNode')
export class OrganizationLevelHierarchyNode {
  @Field(() => String)
  id: string;

  @Field(() => String)
  levelCode: string;

  @Field(() => String)
  levelName: string;

  @Field(() => String, { nullable: true })
  levelNameEn?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  hierarchyLevel: number;

  @Field(() => String, { nullable: true })
  parentLevelId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  defaultPermissions?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  accessLimitations?: object;

  @Field(() => Int)
  displayOrder: number;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  // Hierarchy relationships
  @Field(() => OrganizationLevelHierarchyNode, { nullable: true })
  parent?: OrganizationLevelHierarchyNode;

  @Field(() => [OrganizationLevelHierarchyNode])
  children: OrganizationLevelHierarchyNode[];

  // Statistics
  @Field(() => Int)
  totalEmployees: number;

  @Field(() => Int)
  activeEmployees: number;

  @Field(() => Int)
  directChildrenCount: number;

  @Field(() => Int)
  totalDescendantsCount: number;

  // Metadata
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Raw entity data
  entity?: MktOrganizationLevelWorkspaceEntity;
}
