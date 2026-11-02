import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('SendAppChannelMessageOutput')
export class SendAppChannelMessageOutput {
  @Field(() => UUIDScalarType)
  messageId: string;

  @Field(() => UUIDScalarType)
  messageThreadId: string;
}
