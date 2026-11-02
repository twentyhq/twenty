import { Field, HideField, ObjectType } from '@nestjs/graphql';

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

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
