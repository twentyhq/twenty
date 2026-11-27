import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('RolesReadingAllRecords')
export class RolesReadingAllRecordsDTO {
  @Field(() => Boolean)
  isAdminRoleIncluded: boolean;

  @Field(() => Int)
  otherRoleCount: number;
}
