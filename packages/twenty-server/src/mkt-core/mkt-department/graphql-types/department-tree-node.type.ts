import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class DepartmentTreeNode {
  @Field(() => ID)
  id: string;

  @Field()
  departmentCode: string;

  @Field()
  departmentName: string;

  @Field(() => Int)
  level: number;

  @Field(() => [DepartmentTreeNode])
  children: DepartmentTreeNode[];

  @Field({ nullable: true })
  relationshipType?: string;

  @Field(() => ID, { nullable: true })
  hierarchyId?: string;
}
