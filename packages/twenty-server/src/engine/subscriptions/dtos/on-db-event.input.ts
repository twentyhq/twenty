import { Field, InputType } from '@nestjs/graphql';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class OnDbEventInput {
  @Field(() => DatabaseEventAction, { nullable: true })
  action?: DatabaseEventAction;

  @Field(() => String, { nullable: true })
  objectNameSingular?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  recordId?: string;
}
