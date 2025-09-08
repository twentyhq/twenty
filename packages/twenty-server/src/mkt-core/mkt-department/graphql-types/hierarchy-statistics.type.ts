import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class HierarchyStatistics {
  @Field(() => Int)
  totalHierarchies: number;

  @Field(() => Int)
  activeHierarchies: number;

  @Field(() => Int)
  maxDepth: number;

  @Field()
  averageDepth: number;

  @Field(() => Int)
  orphanedDepartments: number;

  @Field(() => Int)
  circularReferences: number;
}
