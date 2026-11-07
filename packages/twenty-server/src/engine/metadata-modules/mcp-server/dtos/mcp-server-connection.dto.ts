import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@ObjectType('McpServerConnection')
export class McpServerConnectionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  handle: string;

  @Field(() => String)
  scope: ConnectedAccountScope;

  @Field()
  isOwnedByCurrentUser: boolean;

  @Field(() => Date, { nullable: true })
  authFailedAt: Date | null;

  @Field()
  createdAt: Date;
}
