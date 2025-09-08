import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class DepartmentAncestor {
  @Field(() => ID)
  id: string;

  @Field()
  departmentCode: string;

  @Field()
  departmentName: string;

  @Field(() => Int)
  level: number;

  @Field()
  relationshipType: string;

  @Field(() => ID)
  hierarchyId: string;

  @Field(() => Int)
  distance: number;
}
