import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import {
  type McpServerToolAnnotations,
  type McpServerToolInputSchema,
} from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

@ObjectType('McpServerTool')
export class McpServerToolDTO {
  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => GraphQLJSON)
  inputSchema: McpServerToolInputSchema;

  @Field(() => GraphQLJSON, { nullable: true })
  annotations: McpServerToolAnnotations | null;
}
