import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('McpServerTool')
export class McpServerToolDTO {
  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => GraphQLJSON)
  inputSchema: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  annotations: Record<string, unknown> | null;
}
