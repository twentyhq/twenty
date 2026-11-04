import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { McpServerToolDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server-tool.dto';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('McpServer')
export class McpServerDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  name: string;

  @Field()
  label: string;

  @Field()
  url: string;

  @Field(() => UUIDScalarType, { nullable: true })
  connectionProviderId: string | null;

  @Field()
  isActive: boolean;

  @Field(() => [McpServerToolDTO])
  tools: McpServerToolDTO[];

  @Field(() => Date, { nullable: true })
  toolsSyncedAt: Date | null;

  @Field(() => String, { nullable: true })
  toolsSyncError: string | null;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
