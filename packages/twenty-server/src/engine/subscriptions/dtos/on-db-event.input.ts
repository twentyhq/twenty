import { Field, InputType } from '@nestjs/graphql';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@InputType()
export class OnDbEventInput {
  @Field(() => DatabaseEventAction, { nullable: true })
  action?: DatabaseEventAction;

  @Field(() => String, { nullable: true })
  objectNameSingular?: string;

  @Field(() => String, { nullable: true })
  recordId?: string;
}
