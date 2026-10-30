import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('AiActiveTask')
export class AiActiveTaskDTO {
  @Field(() => String, { nullable: true })
  threadId: string | null;

  @Field(() => GraphQLJSON)
  task: Record<string, unknown>;
}
