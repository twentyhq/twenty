import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('McpServerToolTestResult')
export class McpServerToolTestResultDTO {
  @Field()
  success: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  result?: object;

  @Field(() => String, { nullable: true })
  error?: string;
}
