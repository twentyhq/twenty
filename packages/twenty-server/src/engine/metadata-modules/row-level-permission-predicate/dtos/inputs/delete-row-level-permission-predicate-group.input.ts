/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteRowLevelPermissionPredicateGroupInput {
  @Field(() => String)
  id: string;
}
